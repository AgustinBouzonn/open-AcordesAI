import { Router, Request, Response } from 'express';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { serializeSong } from '../serializers/song';

export default function createHistoryRouter(): Router {
  const router = Router();

  router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await query(
        `SELECT s.*, h.viewed_at 
         FROM history h 
         JOIN songs s ON h.song_id = s.id 
         WHERE h.user_id = $1 
         ORDER BY h.viewed_at DESC 
         LIMIT $2`,
        [userId, limit]
      );
      res.json(result.rows.map(serializeSong));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  router.post('/:songId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const { songId } = req.params;
      await query(
        `INSERT INTO history (user_id, song_id) VALUES ($1, $2)
         ON CONFLICT (user_id, song_id) DO UPDATE SET viewed_at = NOW()`,
        [userId, songId]
      );
      res.status(201).json({ message: 'View recorded' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to record view' });
    }
  });

  router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      await query('DELETE FROM history WHERE user_id = $1', [userId]);
      res.json({ message: 'History cleared' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear history' });
    }
  });

  return router;
}
