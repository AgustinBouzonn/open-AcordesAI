import { Router, Request, Response } from 'express';
import { query } from '../db';
import jwt from 'jsonwebtoken';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { JWT_SECRET } from '../env';

// Ruta pública: si viene un token válido se suma la calificación propia; si no, se ignora.
const optionalUserId = (req: Request): number | null => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try {
    return (jwt.verify(token, JWT_SECRET) as { userId: number }).userId;
  } catch {
    return null;
  }
};

export default function createRatingsRouter(): Router {
  const router = Router();

  router.get('/:songId', async (req: Request, res: Response) => {
    try {
      const { songId } = req.params;
      const result = await query(
        `SELECT AVG(score) as avg, COUNT(*) as count FROM ratings WHERE song_id = $1`,
        [songId]
      );
      const userId = optionalUserId(req);
      const mine = userId
        ? (await query('SELECT score FROM ratings WHERE song_id = $1 AND user_id = $2', [songId, userId]))?.rows?.[0]?.score ?? null
        : null;
      res.json({
        average: result.rows[0]?.avg ? parseFloat(result.rows[0].avg).toFixed(1) : null,
        count: parseInt(result.rows[0]?.count) || 0,
        mine,
      });
    } catch {
      res.status(500).json({ error: 'Error fetching ratings' });
    }
  });

  router.post('/:songId', requireAuth, async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { songId } = req.params;
    const { score } = req.body;

    if (!score || score < 1 || score > 5) {
      res.status(400).json({ error: 'Score must be between 1 and 5' });
      return;
    }

    try {
      await query(
        `INSERT INTO ratings (user_id, song_id, score) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, song_id) DO UPDATE SET score = EXCLUDED.score`,
        [userId, songId, score]
      );
      res.json({ message: 'Rating saved' });
    } catch {
      res.status(500).json({ error: 'Error saving rating' });
    }
  });

  return router;
}
