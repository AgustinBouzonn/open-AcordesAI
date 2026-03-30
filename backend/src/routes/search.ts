import { Router, Request, Response } from 'express';

const router = Router();

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
