import { Router, Request, Response } from 'express';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { serializeSong } from '../serializers/song';

export default function createFavoritesRouter(): Router {
  const router = Router();

  router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const result = await query(
        `SELECT s.*, f.created_at as favorited_at 
         FROM favorites f 
         JOIN songs s ON f.song_id = s.id 
         WHERE f.user_id = $1 
         ORDER BY f.created_at DESC`,
        [userId]
      );
      res.json(result.rows.map(serializeSong));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch favorites' });
    }
  });

  router.post('/:songId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const { songId } = req.params;
      await query(
        'INSERT INTO favorites (user_id, song_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, songId]
      );
      res.status(201).json({ message: 'Added to favorites' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add favorite' });
    }
  });

  router.delete('/:songId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const { songId } = req.params;
      await query('DELETE FROM favorites WHERE user_id = $1 AND song_id = $2', [userId, songId]);
      res.json({ message: 'Removed from favorites' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to remove favorite' });
    }
  });

  return router;
}
