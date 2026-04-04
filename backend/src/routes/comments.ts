import { Router, Request, Response } from 'express';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

export default function createCommentsRouter(): Router {
  const router = Router();

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
      res.json(result.rows.map(comment => ({
        id: comment.id,
        songId: comment.song_id,
        userId: comment.user_id,
        username: comment.username,
        content: comment.content,
        createdAt: comment.created_at,
      })));
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch comments' });
    }
  });

  router.post('/:songId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
      const { songId } = req.params;
      const { content } = req.body;
      
      if (!content?.trim()) {
        return res.status(400).json({ error: 'Content is required' });
      }

      const result = await query(
        `INSERT INTO comments (user_id, song_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, song_id, user_id, content, created_at`,
        [userId, songId, content.trim()]
      );
      const comment = result.rows[0];
      res.status(201).json({
        id: comment.id,
        songId: comment.song_id,
        userId: comment.user_id,
        username: req.user?.username,
        content: comment.content,
        createdAt: comment.created_at,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create comment' });
    }
  });

  router.delete('/:commentId', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      
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
