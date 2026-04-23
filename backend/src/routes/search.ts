import { Router, Request, Response } from 'express';
import { query } from '../db';

const router = Router();

router.get('/local', async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim();
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);

  if (!q) {
    res.json({ results: [] });
    return;
  }

  try {
    const like = `%${q}%`;
    const result = await query(
      `-- Bolt Performance Optimization:
       -- Consolidating correlated subqueries (like rating aggregations) on the same table
       -- into a single LEFT JOIN LATERAL to eliminate redundant dependent table scans per row.
       SELECT s.*,
              u.username as author,
              r_stats.rating,
              r_stats.rating_count,
              cc_stats.has_chords
       FROM songs s
       LEFT JOIN users u ON s.user_id = u.id
       LEFT JOIN LATERAL (SELECT AVG(score) as rating, COUNT(*) as rating_count FROM ratings WHERE song_id = s.id) r_stats ON true
       LEFT JOIN LATERAL (SELECT COUNT(*) as has_chords FROM chord_cache WHERE song_id = s.id) cc_stats ON true
       WHERE s.title ILIKE $1 OR s.artist ILIKE $1
       ORDER BY
         CASE
           WHEN s.title ILIKE $2 THEN 0
           WHEN s.artist ILIKE $2 THEN 1
           ELSE 2
         END,
         cc_stats.has_chords DESC,
         s.updated_at DESC,
         s.created_at DESC
       LIMIT $3`,
      [like, `${q}%`, limit]
    );

    res.json({ results: result.rows });
  } catch (e) {
    console.error('[search/local]', e);
    res.status(500).json({ message: 'Error al buscar canciones locales' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  const q = (req.query.q as string)?.trim();
  if (!q) {
    res.json({ results: [] });
    return;
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=10&media=music`;
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!response.ok) {
      res.status(502).json({ message: 'Error al consultar iTunes' });
      return;
    }

    const data = await response.json() as { results?: Record<string, unknown>[] };
    const results = (data.results || []).map((item) => ({
      id: `itunes-${item['trackId']}`,
      title: item['trackName'],
      artist: item['artistName'],
      artworkUrl: (item['artworkUrl100'] as string)?.replace('100x100bb', '300x300bb'),
    }));

    res.json({ results });
  } catch (e) {
    console.error('[search]', e);
    res.status(500).json({ message: 'Error al buscar canciones' });
  }
});

export default router;
