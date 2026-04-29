import { Router, Response } from 'express';
import { query } from '../../db';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { toUserDto } from './utils';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT id, email, username, auth_provider FROM users WHERE id = $1', [req.userId!]);
    if (!result.rows.length) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json({ user: toUserDto(result.rows[0]) });
  } catch (e) {
    console.error('[auth/me]', e);
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/stats', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

    const [songsCreated, favorites, views] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM songs WHERE user_id = $1', [userId]),
      query('SELECT COUNT(*)::int AS count FROM favorites WHERE user_id = $1', [userId]),
      query(
        `SELECT COALESCE(COUNT(h.*), 0)::int AS count
         FROM songs s
         LEFT JOIN history h ON h.song_id = s.id
         WHERE s.user_id = $1`,
        [userId]
      ),
    ]);

    res.json({
      songsCreated: songsCreated.rows[0]?.count ?? 0,
      favorites: favorites.rows[0]?.count ?? 0,
      views: views.rows[0]?.count ?? 0,
    });
  } catch (e) {
    console.error('[auth/stats]', e);
    res.status(500).json({ message: 'Error al cargar estadísticas' });
  }
});

router.get('/export', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const [user, favs, hist, ratings, setlistsRows] = await Promise.all([
      query('SELECT email, username, auth_provider, created_at FROM users WHERE id = $1', [userId]),
      query('SELECT song_id FROM favorites WHERE user_id = $1', [userId]),
      query('SELECT song_id, viewed_at FROM history WHERE user_id = $1', [userId]),
      query('SELECT song_id, score FROM ratings WHERE user_id = $1', [userId]),
      query('SELECT id, name, created_at FROM setlists WHERE user_id = $1', [userId]),
    ]);
    const setlistIds = setlistsRows.rows.map((r) => r.id);
    const setlistSongs = setlistIds.length
      ? await query('SELECT setlist_id, song_id, position FROM setlist_songs WHERE setlist_id = ANY($1::int[])', [setlistIds] as unknown as never[])
      : { rows: [] as { setlist_id: number; song_id: number; position: number }[] };

    res.setHeader('Content-Disposition', `attachment; filename="acordesai-backup-${new Date().toISOString().slice(0, 10)}.json"`);
    res.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      user: user.rows[0],
      favorites: favs.rows.map((r) => r.song_id),
      history: hist.rows.map((r) => ({ songId: r.song_id, viewedAt: r.viewed_at })),
      ratings: ratings.rows.map((r) => ({ songId: r.song_id, score: r.score })),
      setlists: setlistsRows.rows.map((sl) => ({
        name: sl.name,
        createdAt: sl.created_at,
        songs: setlistSongs.rows
          .filter((s) => s.setlist_id === sl.id)
          .sort((a, b) => a.position - b.position)
          .map((s) => s.song_id),
      })),
    });
  } catch (e) {
    console.error('[auth/export]', e);
    res.status(500).json({ message: 'Error al exportar' });
  }
});

router.post('/import', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const data = req.body;
  if (!data || typeof data !== 'object' || data.version !== 1) {
    res.status(400).json({ message: 'Backup inválido o de otra versión' });
    return;
  }
  let imported = { favorites: 0, ratings: 0, setlists: 0 };
  try {
    if (Array.isArray(data.favorites)) {
      for (const songId of data.favorites) {
        if (typeof songId === 'number' || /^\d+$/.test(String(songId))) {
          const result = await query(
            'INSERT INTO favorites (user_id, song_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING song_id',
            [userId, Number(songId)],
          );
          if (result.rows.length) imported.favorites += 1;
        }
      }
    }
    if (Array.isArray(data.ratings)) {
      for (const r of data.ratings) {
        if (r && typeof r.songId !== 'undefined' && Number.isInteger(r.score) && r.score >= 1 && r.score <= 5) {
          await query(
            `INSERT INTO ratings (user_id, song_id, score) VALUES ($1, $2, $3)
             ON CONFLICT (user_id, song_id) DO UPDATE SET score = EXCLUDED.score`,
            [userId, Number(r.songId), r.score],
          );
          imported.ratings += 1;
        }
      }
    }
    if (Array.isArray(data.setlists)) {
      for (const sl of data.setlists) {
        if (!sl || typeof sl.name !== 'string' || !sl.name.trim()) continue;
        const created = await query(
          'INSERT INTO setlists (user_id, name) VALUES ($1, $2) RETURNING id',
          [userId, sl.name.trim().slice(0, 120)],
        );
        const newId = created.rows[0].id;
        if (Array.isArray(sl.songs)) {
          for (let i = 0; i < sl.songs.length; i++) {
            const songId = Number(sl.songs[i]);
            if (Number.isInteger(songId)) {
              await query(
                'INSERT INTO setlist_songs (setlist_id, song_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
                [newId, songId, i + 1],
              );
            }
          }
        }
        imported.setlists += 1;
      }
    }
    res.json({ message: 'Importación completa', imported });
  } catch (e) {
    console.error('[auth/import]', e);
    res.status(500).json({ message: 'Error al importar', imported });
  }
});

export default router;
