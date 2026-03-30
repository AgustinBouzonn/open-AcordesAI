import { Router, Request, Response } from 'express';
import { query } from '../db';
import { generateChords } from '../services/aiService';

const router = Router();

export default function createSongsRouter(): Router {
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
      res.json(result.rows);
    } catch (e) {
      res.status(500).json({ message: 'Error fetching popular songs' });
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await query(
        `SELECT s.*, u.username as author, 
         (SELECT AVG(score) FROM ratings WHERE song_id = s.id) as rating,
         (SELECT COUNT(*) FROM ratings WHERE song_id = s.id) as rating_count,
         (SELECT COUNT(*) FROM chord_cache WHERE song_id = s.id) as has_chords
         FROM songs s 
         LEFT JOIN users u ON s.user_id = u.id
         ORDER BY s.created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      res.json(result.rows);
    } catch (e) {
      res.status(500).json({ message: 'Error fetching songs' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await query('SELECT * FROM songs WHERE id = $1', [id]);
      
      if (!result.rows.length) {
        res.status(404).json({ message: 'Song not found' });
        return;
      }
      
      res.json(result.rows[0]);
    } catch (e) {
      res.status(500).json({ message: 'Error fetching song' });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
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
      
      res.status(201).json(result.rows[0]);
    } catch (e) {
      console.error('[songs/create]', e);
      res.status(500).json({ message: 'Error creating song' });
    }
  });

  router.post('/:id/chords', async (req: Request, res: Response) => {
    const { id } = req.params;

    const songResult = await query('SELECT * FROM songs WHERE id = $1', [id]);
    if (!songResult.rows.length) {
      res.status(404).json({ message: 'Song not found' });
      return;
    }

    const song = songResult.rows[0];

    const cached = await query(
      'SELECT content FROM chord_cache WHERE song_id = $1',
      [id]
    );

    if (cached.rows.length) {
      res.json({ chords: cached.rows[0].content });
      return;
    }

    try {
      const result = await generateChords(song.title, song.artist, 'guitar');

      await query(
        `INSERT INTO chord_cache (song_id, instrument, title, artist, key, content)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (song_id, instrument) DO UPDATE SET content = EXCLUDED.content, key = EXCLUDED.key`,
        [id, 'guitar', result.title, result.artist, result.key, result.content]
      );

      res.json({ chords: result.content });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Error generating chords';
      console.error('[songs/chords]', e);
      res.status(500).json({ message });
    }
  });

  router.put('/:id/chords', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { chords } = req.body;
    const userId = (req as any).user?.id;

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

      await query(
        `INSERT INTO chord_cache (song_id, instrument, title, artist, content)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (song_id, instrument) DO UPDATE SET content = EXCLUDED.content`,
        [id, 'guitar', songResult.rows[0].title, songResult.rows[0].artist, chords]
      );

      res.json({ message: 'Cifrado guardado correctamente' });
    } catch (e) {
      console.error('[songs/chords/save]', e);
      res.status(500).json({ message: 'Error al guardar el cifrado' });
    }
  });

  return router;
}
