import { Router, Request, Response } from 'express';
import { query } from '../db';
import { AuthRequest, getRequiredUser, requireAuth } from '../middleware/auth';

const router = Router();

export default function createCommentsRouter(): Router {
  router.get('/:songId', async (req: Request, res: Response) => {
    try {
      const { songId } = req.params;
      const result = await query(
        `SELECT c.*, u.username 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.song_id = $1 
         ORDER BY c.created_at DESC`,
        [songId]
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  router.post('/:songId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const user = getRequiredUser(req);
      
      const { songId } = req.params;
      const { content } = req.body;
      
      if (!content?.trim()) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const result = await query(
        `INSERT INTO comments (user_id, song_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, user_id, song_id, content, created_at`,
        [user.id, songId, content.trim()]
      );
      res.status(201).json({
        ...result.rows[0],
        username: user.username || 'Usuario',
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  router.delete('/:commentId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = getRequiredUser(req).id;
      
      const { commentId } = req.params;
      
      const result = await query(
        'DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *',
        [commentId, userId]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }
      res.json({ message: 'Comment deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

  return router;
}
