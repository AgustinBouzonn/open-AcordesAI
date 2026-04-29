import { Router, Response } from 'express';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { serializeSong } from '../serializers/song';

const router = Router();
router.use(requireAuth);

const VALID_STATUS = new Set(['learning', 'learned']);

router.get('/me', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query(
      `SELECT s.*, u.username AS author, p.status, p.updated_at AS progress_updated_at
       FROM user_song_progress p
       JOIN songs s ON s.id = p.song_id
       LEFT JOIN users u ON u.id = s.user_id
       WHERE p.user_id = $1
       ORDER BY p.updated_at DESC`,
      [req.userId!],
    );
    res.json({
      learning: result.rows.filter((r) => r.status === 'learning').map((r) => ({ ...serializeSong(r), progressUpdatedAt: r.progress_updated_at })),
      learned: result.rows.filter((r) => r.status === 'learned').map((r) => ({ ...serializeSong(r), progressUpdatedAt: r.progress_updated_at })),
    });
  } catch (e) {
    console.error('[progress/me]', e);
    res.status(500).json({ message: 'Error al cargar progreso' });
  }
});

router.get('/:songId', async (req: AuthRequest, res: Response): Promise<void> => {
  const songId = parseInt(req.params.songId, 10);
  if (Number.isNaN(songId)) { res.status(400).json({ message: 'ID inválido' }); return; }
  try {
    const result = await query(
      'SELECT status, updated_at FROM user_song_progress WHERE user_id = $1 AND song_id = $2',
      [req.userId!, songId],
    );
    res.json({ status: result.rows[0]?.status ?? null, updatedAt: result.rows[0]?.updated_at ?? null });
  } catch (e) {
    console.error('[progress/get]', e);
    res.status(500).json({ message: 'Error' });
  }
});

router.put('/:songId', async (req: AuthRequest, res: Response): Promise<void> => {
  const songId = parseInt(req.params.songId, 10);
  const { status } = req.body ?? {};
  if (Number.isNaN(songId)) { res.status(400).json({ message: 'ID inválido' }); return; }
  if (!VALID_STATUS.has(status)) { res.status(400).json({ message: 'status inválido (learning | learned)' }); return; }
  try {
    await query(
      `INSERT INTO user_song_progress (user_id, song_id, status) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, song_id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()`,
      [req.userId!, songId, status],
    );
    res.json({ message: 'OK' });
  } catch (e) {
    console.error('[progress/put]', e);
    res.status(500).json({ message: 'Error' });
  }
});

router.delete('/:songId', async (req: AuthRequest, res: Response): Promise<void> => {
  const songId = parseInt(req.params.songId, 10);
  if (Number.isNaN(songId)) { res.status(400).json({ message: 'ID inválido' }); return; }
  try {
    await query('DELETE FROM user_song_progress WHERE user_id = $1 AND song_id = $2', [req.userId!, songId]);
    res.json({ message: 'OK' });
  } catch (e) {
    console.error('[progress/delete]', e);
    res.status(500).json({ message: 'Error' });
  }
});

export default router;
