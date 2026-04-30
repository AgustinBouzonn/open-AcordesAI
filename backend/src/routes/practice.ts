import { Router, Response } from 'express';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { serializeSong } from '../serializers/song';

const router = Router();
router.use(requireAuth);

const MAX_DURATION = 86400;

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { songId, durationSec } = req.body ?? {};
  const sid = Number(songId);
  const dur = Number(durationSec);
  if (!Number.isInteger(sid) || sid <= 0) {
    res.status(400).json({ message: 'songId inválido' }); return;
  }
  if (!Number.isFinite(dur) || dur < 5 || dur > MAX_DURATION) {
    res.status(400).json({ message: 'durationSec debe estar entre 5 y 86400' }); return;
  }
  try {
    const songExists = await query('SELECT 1 FROM songs WHERE id = $1', [sid]);
    if (!songExists.rows.length) { res.status(404).json({ message: 'Canción no encontrada' }); return; }
    await query(
      'INSERT INTO practice_sessions (user_id, song_id, duration_sec) VALUES ($1, $2, $3)',
      [req.userId!, sid, Math.round(dur)],
    );
    res.status(201).json({ message: 'OK' });
  } catch (e) {
    console.error('[practice/create]', e);
    res.status(500).json({ message: 'Error al guardar sesión' });
  }
});

router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const [summary, byDay, topSongs] = await Promise.all([
      query(
        `SELECT
            COALESCE(SUM(duration_sec), 0)::int AS total_sec,
            COALESCE(COUNT(*), 0)::int        AS sessions,
            COALESCE(COUNT(DISTINCT song_id), 0)::int AS unique_songs
         FROM practice_sessions
         WHERE user_id = $1`,
        [userId],
      ),
      query(
        `SELECT date_trunc('day', started_at)::date AS day,
                SUM(duration_sec)::int             AS sec
         FROM practice_sessions
         WHERE user_id = $1 AND started_at >= NOW() - INTERVAL '30 days'
         GROUP BY 1
         ORDER BY 1 ASC`,
        [userId],
      ),
      query(
        `SELECT s.*, u.username AS author,
                SUM(p.duration_sec)::int AS practiced_sec,
                COUNT(*)::int            AS sessions
         FROM practice_sessions p
         JOIN songs s ON s.id = p.song_id
         LEFT JOIN users u ON u.id = s.user_id
         WHERE p.user_id = $1
         GROUP BY s.id, u.username
         ORDER BY practiced_sec DESC
         LIMIT 10`,
        [userId],
      ),
    ]);

    res.json({
      totalSec: summary.rows[0]?.total_sec ?? 0,
      sessions: summary.rows[0]?.sessions ?? 0,
      uniqueSongs: summary.rows[0]?.unique_songs ?? 0,
      byDay: byDay.rows.map((r) => ({ day: r.day, sec: r.sec })),
      topSongs: topSongs.rows.map((r) => ({
        ...serializeSong(r),
        practicedSec: r.practiced_sec,
        sessions: r.sessions,
      })),
    });
  } catch (e) {
    console.error('[practice/stats]', e);
    res.status(500).json({ message: 'Error al cargar estadísticas' });
  }
});

export default router;
