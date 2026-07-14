import { Router, Response } from 'express';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { serializeSong } from '../serializers/song';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.userId!;
  const limit = Math.min(parseInt(req.query.limit as string) || 12, 30);

  try {
    const collab = await query(
      `WITH my_favs AS (
         SELECT song_id FROM favorites WHERE user_id = $1
       ),
       neighbors AS (
         SELECT f.user_id, COUNT(*) AS overlap
         FROM favorites f
         JOIN my_favs m ON m.song_id = f.song_id
         WHERE f.user_id <> $1
         GROUP BY f.user_id
       )
       SELECT s.*, u.username AS author,
              SUM(n.overlap)::int AS score,
              COALESCE(cc.cnt, 0)::int AS has_chords
       FROM neighbors n
       JOIN favorites f ON f.user_id = n.user_id
       JOIN songs s ON s.id = f.song_id
       LEFT JOIN users u ON u.id = s.user_id
       LEFT JOIN LATERAL (SELECT COUNT(*) AS cnt FROM chord_cache WHERE song_id = s.id) cc ON true
       WHERE s.id NOT IN (SELECT song_id FROM my_favs)
         AND s.id NOT IN (SELECT song_id FROM history WHERE user_id = $1)
       GROUP BY s.id, u.username, cc.cnt
       ORDER BY score DESC, has_chords DESC
       LIMIT $2`,
      [userId, limit],
    );

    if (collab.rows.length >= 4) {
      res.json({ source: 'collaborative', results: collab.rows.map(serializeSong) });
      return;
    }

    const fallback = await query(
      // ⚡ Bolt Performance Optimization: Replace GROUP BY subqueries with LATERAL JOINs for better index usage
      `SELECT s.*, u.username AS author,
              COALESCE(r.avg, 0) AS rating,
              COALESCE(f.cnt, 0)::int AS fav_count,
              COALESCE(cc.cnt, 0)::int AS has_chords
       FROM songs s
       LEFT JOIN users u ON u.id = s.user_id
       LEFT JOIN LATERAL (SELECT AVG(score) AS avg FROM ratings WHERE song_id = s.id) r ON true
       LEFT JOIN LATERAL (SELECT COUNT(*) AS cnt FROM favorites WHERE song_id = s.id) f ON true
       INNER JOIN LATERAL (SELECT COUNT(*) AS cnt FROM chord_cache WHERE song_id = s.id) cc ON true
       WHERE s.id NOT IN (SELECT song_id FROM favorites WHERE user_id = $1)
         AND cc.cnt > 0
       ORDER BY fav_count DESC, rating DESC, s.created_at DESC
       LIMIT $2`,
      [userId, limit],
    );
    res.json({ source: 'popular', results: fallback.rows.map(serializeSong) });
  } catch (e) {
    console.error('[recommendations]', e);
    res.status(500).json({ message: 'Error al cargar recomendaciones' });
  }
});

export default router;
