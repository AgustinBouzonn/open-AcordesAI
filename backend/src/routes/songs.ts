import { Router, Request, Response } from 'express';
import { query } from '../db';
import { generateChords } from '../services/aiService';
import { attachOptionalUser, AuthRequest, getRequiredUser, requireAuth } from '../middleware/auth';

const router = Router();

const normalizeSongField = (value: string): string =>
  value.trim().replace(/\s+/g, ' ');

const findReusableSong = async (title: string, artist: string) => {
  const result = await query(
    `SELECT s.*
     FROM songs s
     WHERE regexp_replace(lower(trim(s.title)), '\s+', ' ', 'g') = regexp_replace(lower(trim($1)), '\s+', ' ', 'g')
       AND regexp_replace(lower(trim(s.artist)), '\s+', ' ', 'g') = regexp_replace(lower(trim($2)), '\s+', ' ', 'g')
     ORDER BY
       (SELECT COUNT(*) FROM chord_cache WHERE song_id = s.id) DESC,
       s.updated_at DESC,
       s.created_at DESC
     LIMIT 1`,
    [title, artist]
  );

  return result.rows[0] ?? null;
};

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

  router.get('/:id', attachOptionalUser, async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const viewerId = req.user?.id ?? null;
      const result = await query(
        `SELECT s.*,
                u.username as author,
                (SELECT AVG(score) FROM ratings WHERE song_id = s.id) as rating,
                (SELECT COUNT(*) FROM ratings WHERE song_id = s.id) as rating_count,
                (SELECT COUNT(*) FROM chord_cache WHERE song_id = s.id) as has_chords,
                (SELECT COUNT(*) FROM history WHERE song_id = s.id) as view_count,
                (SELECT COUNT(*) FROM comments WHERE song_id = s.id) as comments_count,
                CASE
                  WHEN $2::integer IS NULL THEN false
                  ELSE EXISTS (SELECT 1 FROM favorites WHERE song_id = s.id AND user_id = $2)
                END as is_favorite,
                (SELECT score FROM ratings WHERE song_id = s.id AND user_id = $2 LIMIT 1) as user_rating
         FROM songs s
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = $1
         LIMIT 1`,
        [id, viewerId]
      );
      
      if (!result.rows.length) {
        res.status(404).json({ message: 'Song not found' });
        return;
      }
      
      res.json(result.rows[0]);
    } catch (e) {
      res.status(500).json({ message: 'Error fetching song' });
    }
  });

  router.get('/:id/chords', async (req: Request, res: Response) => {
    const { id } = req.params;
    const instrument = typeof req.query.instrument === 'string' ? req.query.instrument : 'guitar';

    try {
      const cached = await query(
        'SELECT content FROM chord_cache WHERE song_id = $1 AND instrument = $2',
        [id, instrument]
      );

      if (!cached.rows.length) {
        res.status(404).json({ message: 'No cached chords found' });
        return;
      }

      res.json({ chords: cached.rows[0].content });
    } catch (e) {
      console.error('[songs/chords/get]', e);
      res.status(500).json({ message: 'Error fetching cached chords' });
    }
  });

  router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = getRequiredUser(req).id;
      
      const rawTitle = typeof req.body?.title === 'string' ? req.body.title : '';
      const rawArtist = typeof req.body?.artist === 'string' ? req.body.artist : '';
      const rawLyrics = typeof req.body?.lyrics === 'string' ? req.body.lyrics : undefined;
      const title = normalizeSongField(rawTitle);
      const artist = normalizeSongField(rawArtist);
      const lyrics = rawLyrics?.trim() || null;
      
      if (!title || !artist) {
        res.status(400).json({ message: 'Title and artist are required' });
        return;
      }

      const existingSong = await findReusableSong(title, artist);
      if (existingSong) {
        if (!existingSong.lyrics && lyrics) {
          const updated = await query(
            'UPDATE songs SET lyrics = $2, updated_at = NOW() WHERE id = $1 RETURNING *',
            [existingSong.id, lyrics]
          );
          res.status(200).json({ ...updated.rows[0], reused: true });
          return;
        }

        res.status(200).json({ ...existingSong, reused: true });
        return;
      }

      const result = await query(
        'INSERT INTO songs (title, artist, lyrics, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, artist, lyrics, userId]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (e) {
      console.error('[songs/create]', e);
      res.status(500).json({ message: 'Error creating song' });
    }
  });

  router.post('/:id/chords', async (req: Request, res: Response) => {
    const { id } = req.params;
    const instrument = typeof req.body?.instrument === 'string' ? req.body.instrument : 'guitar';

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

  router.put('/:id/chords', requireAuth, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { chords } = req.body;
    const instrument = typeof req.body?.instrument === 'string' ? req.body.instrument : 'guitar';
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
