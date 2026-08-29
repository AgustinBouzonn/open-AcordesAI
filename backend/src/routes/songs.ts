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

  router.get('/by-chords', async (req: Request, res: Response) => {
    const raw = typeof req.query.chords === 'string' ? req.query.chords : '';
    const chords = raw.split(/[,\s]+/).map((c) => c.trim()).filter((c) => /^[A-G](#|b)?[a-z0-9#/]{0,6}$/i.test(c)).slice(0, 8);
    if (chords.length === 0) {
      res.status(400).json({ message: 'Pasá al menos un acorde válido (ej: C, G, Am, F)' });
      return;
    }
    const limit = Math.min(parseInt(req.query.limit as string) || 30, 60);
    try {
      const conditions = chords.map((_, i) => `cc.content ~* ('(^|[^A-Za-z])' || $${i + 1} || '($|[^A-Za-z0-9#b])')`).join(' AND ');
      const sql = `
        SELECT s.*, u.username AS author,
               ${chords.map((_, i) => `(cc.content ~* ('(^|[^A-Za-z])' || $${i + 1} || '($|[^A-Za-z0-9#b])'))::int`).join(' + ')} AS matches
        FROM chord_cache cc
        JOIN songs s ON s.id = cc.song_id
        LEFT JOIN users u ON s.user_id = u.id
        WHERE cc.instrument = 'guitar' AND ${conditions}
        ORDER BY matches DESC, s.created_at DESC
        LIMIT $${chords.length + 1}
      `;
      const result = await query(sql, [...chords, limit]);
      res.json({ chords, results: result.rows.map(serializeSong) });
    } catch (e) {
      console.error('[songs/by-chords]', e);
      res.status(500).json({ message: 'Error en la búsqueda por acordes' });
    }
  });

  router.get('/popular', async (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await query(
        `SELECT s.*, u.username AS author,
                COALESCE(r.avg_score, 0) AS rating,
                COALESCE(r.cnt, 0)       AS rating_count,
                COALESCE(f.cnt, 0)       AS fav_count,
                COALESCE(h.cnt, 0)       AS view_count,
                cc.cnt                    AS has_chords
         FROM songs s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN (SELECT song_id, AVG(score) AS avg_score, COUNT(*) AS cnt FROM ratings GROUP BY song_id) r ON r.song_id = s.id
         LEFT JOIN (SELECT song_id, COUNT(*) AS cnt FROM favorites GROUP BY song_id) f ON f.song_id = s.id
         LEFT JOIN (SELECT song_id, COUNT(*) AS cnt FROM history GROUP BY song_id) h ON h.song_id = s.id
         INNER JOIN (SELECT song_id, COUNT(*) AS cnt FROM chord_cache GROUP BY song_id) cc ON cc.song_id = s.id
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
      // ⚡ Bolt Performance Optimization: Consolidate correlated subqueries into LEFT JOIN LATERAL to prevent redundant index lookups per row and avoid N+1 query issues.
      const result = await query(
        `SELECT s.*, u.username as author, 
         r.rating,
         r.rating_count,
         cc.has_chords
         FROM songs s 
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN LATERAL (
           SELECT AVG(score) AS rating, COUNT(*) AS rating_count FROM ratings WHERE song_id = s.id
         ) r ON true
         LEFT JOIN LATERAL (
           SELECT COUNT(*) AS has_chords FROM chord_cache WHERE song_id = s.id
         ) cc ON true
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

  router.put('/:id/youtube', requireAuth, async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id, 10);
    const { url } = req.body ?? {};
    if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
    const cleaned = typeof url === 'string' ? url.trim() : '';
    if (cleaned && !/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\//i.test(cleaned)) {
      res.status(400).json({ message: 'Solo URLs de YouTube son aceptadas' });
      return;
    }
    try {
      const owner = await query('SELECT user_id FROM songs WHERE id = $1', [id]);
      if (!owner.rows.length) { res.status(404).json({ message: 'No encontrada' }); return; }
      if (owner.rows[0].user_id !== req.userId) { res.status(403).json({ message: 'Solo el autor puede asociar un video' }); return; }
      await query('UPDATE songs SET youtube_url = $1 WHERE id = $2', [cleaned || null, id]);
      res.json({ message: cleaned ? 'Video asociado' : 'Video quitado' });
    } catch (e) {
      console.error('[songs/youtube]', e);
      res.status(500).json({ message: 'Error al guardar el video' });
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
