import { Router, Request, Response } from 'express';
import { query } from '../db';
import { generateChords } from '../services/aiService';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { chordGenerationLimiter, chordSaveLimiter } from '../middleware/rateLimit';
import { serializeSong } from '../serializers/song';

const VALID_INSTRUMENTS = new Set(['guitar', 'ukulele', 'piano']);

const getInstrument = (value: unknown): 'guitar' | 'ukulele' | 'piano' => {
  if (typeof value === 'string' && VALID_INSTRUMENTS.has(value)) {
    return value as 'guitar' | 'ukulele' | 'piano';
  }
  return 'guitar';
};

export default function createSongsRouter(): Router {
  const router = Router();

  router.get('/popular', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await query(
        `SELECT s.*, u.username as author,
         COALESCE((SELECT AVG(score) FROM ratings WHERE song_id = s.id), 0) as rating,
         (SELECT COUNT(*) FROM ratings WHERE song_id = s.id) as rating_count,
         (SELECT COUNT(*) FROM favorites WHERE song_id = s.id) as fav_count,
         (SELECT COUNT(*) FROM history WHERE song_id = s.id) as view_count,
         (SELECT COUNT(*) FROM chord_cache WHERE song_id = s.id) as has_chords
         FROM songs s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN chord_cache cc ON s.id = cc.song_id
         WHERE cc.id IS NOT NULL
         ORDER BY rating_count DESC, fav_count DESC, view_count DESC
         LIMIT $1`,
        [limit]
      );
      res.json(result.rows.map(serializeSong));
    } catch (e) {
      res.status(500).json({ message: 'Error fetching popular songs' });
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
      const result = await query(
        `SELECT s.*, u.username as author, 
         (SELECT AVG(score) FROM ratings WHERE song_id = s.id) as rating,
         (SELECT COUNT(*) FROM ratings WHERE song_id = s.id) as rating_count,
         (SELECT COUNT(*) FROM chord_cache WHERE song_id = s.id) as has_chords
         FROM songs s 
         LEFT JOIN users u ON s.user_id = u.id
         WHERE ($1 = '' OR s.title ILIKE '%' || $1 || '%' OR s.artist ILIKE '%' || $1 || '%')
         ORDER BY
           CASE
             WHEN $1 = '' THEN 0
             WHEN LOWER(s.title) = LOWER($1) THEN 0
             WHEN LOWER(s.title) LIKE LOWER($1) || '%' THEN 1
             WHEN LOWER(s.artist) = LOWER($1) THEN 2
             WHEN LOWER(s.artist) LIKE LOWER($1) || '%' THEN 3
             WHEN s.title ILIKE '%' || $1 || '%' THEN 4
             WHEN s.artist ILIKE '%' || $1 || '%' THEN 5
             ELSE 6
           END,
           CASE
             WHEN s.title ILIKE '%' || $1 || '%' THEN POSITION(LOWER($1) IN LOWER(s.title))
             ELSE 999999
           END,
           CASE
             WHEN s.artist ILIKE '%' || $1 || '%' THEN POSITION(LOWER($1) IN LOWER(s.artist))
             ELSE 999999
           END,
           s.created_at DESC
         LIMIT $2 OFFSET $3`,
        [q, limit, offset]
      );
      res.json(result.rows.map(serializeSong));
    } catch (e) {
      res.status(500).json({ message: 'Error fetching songs' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await query(
        `SELECT s.*, cc.content AS chords
         FROM songs s
         LEFT JOIN chord_cache cc ON cc.song_id = s.id AND cc.instrument = 'guitar'
         WHERE s.id = $1`,
        [id]
      );
      
      if (!result.rows.length) {
        res.status(404).json({ message: 'Song not found' });
        return;
      }
      
      res.json(serializeSong(result.rows[0]));
    } catch (e) {
      res.status(500).json({ message: 'Error fetching song' });
    }
  });

  router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const { title, artist, lyrics } = req.body;
      
      if (!title || !artist) {
        res.status(400).json({ message: 'Title and artist are required' });
        return;
      }

      const result = await query(
        'INSERT INTO songs (title, artist, lyrics, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, artist, lyrics || null, userId]
      );
      
      res.status(201).json(serializeSong(result.rows[0]));
    } catch (e) {
      console.error('[songs/create]', e);
      res.status(500).json({ message: 'Error creating song' });
    }
  });

  router.post('/:id/chords', requireAuth, chordGenerationLimiter, async (req: Request, res: Response) => {
    const { id } = req.params;
    const instrument = getInstrument(req.body?.instrument);

    const songResult = await query('SELECT * FROM songs WHERE id = $1', [id]);
    if (!songResult.rows.length) {
      res.status(404).json({ message: 'Song not found' });
      return;
    }

    const song = songResult.rows[0];

    const cached = await query(
      'SELECT content FROM chord_cache WHERE song_id = $1 AND instrument = $2',
      [id, instrument]
    );

    if (cached.rows.length) {
      res.json({ chords: cached.rows[0].content });
      return;
    }

    try {
      const result = await generateChords(song.title, song.artist, instrument);

      await query(
        `INSERT INTO chord_cache (song_id, instrument, title, artist, key, content)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (song_id, instrument) DO UPDATE SET content = EXCLUDED.content, key = EXCLUDED.key`,
        [id, instrument, result.title, result.artist, result.key, result.content]
      );

      res.json({ chords: result.content });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error generating chords';
      console.error('[songs/chords]', e);
      res.status(500).json({ message });
    }
  });

  router.put('/:id/chords', requireAuth, chordSaveLimiter, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { chords } = req.body;
    const instrument = getInstrument(req.body?.instrument);
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Debes iniciar sesión para guardar cifrados' });
      return;
    }

    if (!chords) {
      res.status(400).json({ message: 'El contenido del cifrado es requerido' });
      return;
    }

    try {
      const songResult = await query('SELECT * FROM songs WHERE id = $1', [id]);
      if (!songResult.rows.length) {
        res.status(404).json({ message: 'Song not found' });
        return;
      }

      if (songResult.rows[0].user_id !== userId) {
        res.status(403).json({ message: 'No puedes modificar el cifrado de otra canción' });
        return;
      }

      await query(
        `INSERT INTO chord_cache (song_id, instrument, title, artist, content)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (song_id, instrument) DO UPDATE SET content = EXCLUDED.content`,
        [id, instrument, songResult.rows[0].title, songResult.rows[0].artist, chords]
      );

      res.json({ message: 'Cifrado guardado correctamente' });
    } catch (e) {
      console.error('[songs/chords/save]', e);
      res.status(500).json({ message: 'Error al guardar el cifrado' });
    }
  });

  return router;
}
