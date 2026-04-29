import { Router, Response } from 'express';
import { query } from '../../db';
import { requireAuth, AuthRequest } from '../../middleware/auth';
import { toUserDto } from './utils';

const router = Router();

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT id, email, username, auth_provider FROM users WHERE id = $1', [req.userId!]);
    if (!result.rows.length) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json({ user: toUserDto(result.rows[0]) });
  } catch (e) {
    console.error('[auth/me]', e);
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/stats', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

    const [songsCreated, favorites, views] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM songs WHERE user_id = $1', [userId]),
      query('SELECT COUNT(*)::int AS count FROM favorites WHERE user_id = $1', [userId]),
      query(
        `SELECT COALESCE(COUNT(h.*), 0)::int AS count
         FROM songs s
         LEFT JOIN history h ON h.song_id = s.id
         WHERE s.user_id = $1`,
        [userId]
      ),
    ]);

    res.json({
      songsCreated: songsCreated.rows[0]?.count ?? 0,
      favorites: favorites.rows[0]?.count ?? 0,
      views: views.rows[0]?.count ?? 0,
    });
  } catch (e) {
    console.error('[auth/stats]', e);
    res.status(500).json({ message: 'Error al cargar estadísticas' });
  }
});

export default router;
