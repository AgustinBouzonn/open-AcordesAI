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

// ⚡ Bolt: Use PostgreSQL unnest for bulk inserts to fix N+1 query problem during data import
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
      // Deduplicate to avoid PostgreSQL ON CONFLICT DO NOTHING issues with duplicate rows
      const favSongs = [...new Set(data.favorites
        .map(Number)
        .filter((id: number) => Number.isInteger(id) && id > 0))];

      if (favSongs.length > 0) {
        const result = await query(
          `INSERT INTO favorites (user_id, song_id)
           SELECT $1, unnest($2::int[])
           ON CONFLICT DO NOTHING RETURNING song_id`,
          [userId, favSongs as number[]]
        );
        imported.favorites = result.rows.length;
      }
    }

    if (Array.isArray(data.ratings)) {
      // Keep only the last valid rating per song to avoid 'ON CONFLICT DO UPDATE command cannot affect row a second time'
      const validRatingsMap = new Map<number, number>();
      data.ratings.forEach((r: any) => {
        if (r && typeof r.songId !== 'undefined' && Number.isInteger(r.score) && r.score >= 1 && r.score <= 5) {
          validRatingsMap.set(Number(r.songId), r.score);
        }
      });

      if (validRatingsMap.size > 0) {
        const songIds = Array.from(validRatingsMap.keys());
        const scores = Array.from(validRatingsMap.values());

        const result = await query(
          `INSERT INTO ratings (user_id, song_id, score)
           SELECT $1, unnest($2::int[]), unnest($3::int[])
           ON CONFLICT (user_id, song_id) DO UPDATE SET score = EXCLUDED.score RETURNING song_id`,
          [userId, songIds as number[], scores as number[]]
        );
        imported.ratings = result.rows.length;
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
          // Keep deduplication logic strictly aligned with PostgreSQL array structure
          const songIds = sl.songs.map(Number).filter(Number.isInteger);
          if (songIds.length > 0) {
            const positions = songIds.map((_: number, i: number) => i + 1);
            await query(
              `INSERT INTO setlist_songs (setlist_id, song_id, position)
               SELECT $1, unnest($2::int[]), unnest($3::int[])
               ON CONFLICT DO NOTHING`,
              [newId, songIds as number[], positions as number[]]
            );
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
