import { Router, Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest, getRequiredUser } from '../middleware/auth';

const router = Router();

export default function createHistoryRouter(): Router {
  router.get('/', async (req: AuthRequest, res: Response) => {
    try {
      const userId = getRequiredUser(req).id;
      
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
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  router.post('/:songId', async (req: AuthRequest, res: Response) => {
    try {
      const userId = getRequiredUser(req).id;
      
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

  router.delete('/', async (req: AuthRequest, res: Response) => {
    try {
      const userId = getRequiredUser(req).id;
      
      await query('DELETE FROM history WHERE user_id = $1', [userId]);
      res.json({ message: 'History cleared' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear history' });
    }
  });

  return router;
}
