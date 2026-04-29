import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { serializeSong } from '../serializers/song';

const router = Router();

router.get('/public/:token', async (req: Request, res: Response): Promise<void> => {
  const token = req.params.token;
  if (!token || !/^[a-f0-9]{32}$/.test(token)) {
    res.status(400).json({ message: 'Token inválido' });
    return;
  }
  try {
    const sl = await query(
      `SELECT s.id, s.name, s.created_at, s.updated_at, u.username AS owner
       FROM setlists s LEFT JOIN users u ON u.id = s.user_id
       WHERE s.share_token = $1`,
      [token],
    );
    if (!sl.rows.length) { res.status(404).json({ message: 'Setlist no encontrada o no pública' }); return; }
    const songs = await query(
      `SELECT s.*, ss.position, u.username AS author
       FROM setlist_songs ss
       JOIN songs s ON s.id = ss.song_id
       LEFT JOIN users u ON u.id = s.user_id
       WHERE ss.setlist_id = $1
       ORDER BY ss.position ASC`,
      [sl.rows[0].id],
    );
    const row = sl.rows[0];
    res.json({
      id: row.id, name: row.name, owner: row.owner, createdAt: row.created_at, updatedAt: row.updated_at,
      songs: songs.rows.map((r) => ({ ...serializeSong(r), position: r.position })),
    });
  } catch (e) {
    console.error('[setlists/public]', e);
    res.status(500).json({ message: 'Error al cargar setlist' });
  }
});

router.use(requireAuth);

router.post('/:id/share', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
  try {
    const existing = await query('SELECT share_token FROM setlists WHERE id = $1 AND user_id = $2', [id, req.userId!]);
    if (!existing.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }
    let token = existing.rows[0].share_token as string | null;
    if (!token) {
      token = crypto.randomBytes(16).toString('hex');
      await query('UPDATE setlists SET share_token = $1, updated_at = NOW() WHERE id = $2', [token, id]);
    }
    res.json({ token });
  } catch (e) {
    console.error('[setlists/share]', e);
    res.status(500).json({ message: 'Error al generar enlace' });
  }
});

router.delete('/:id/share', async (req: AuthRequest, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
  try {
    const result = await query(
      'UPDATE setlists SET share_token = NULL, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.userId!],
    );
    if (!result.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }
    res.json({ message: 'Enlace deshabilitado' });
  } catch (e) {
    console.error('[setlists/unshare]', e);
    res.status(500).json({ message: 'Error al deshabilitar enlace' });
  }
});

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query(
      `SELECT s.id, s.name, s.created_at, s.updated_at,
              COALESCE(c.cnt, 0)::int AS song_count
       FROM setlists s
       LEFT JOIN (SELECT setlist_id, COUNT(*) AS cnt FROM setlist_songs GROUP BY setlist_id) c
              ON c.setlist_id = s.id
       WHERE s.user_id = $1
       ORDER BY s.updated_at DESC`,
      [req.userId!],
    );
    res.json(result.rows.map((r) => ({
      id: r.id, name: r.name, songCount: r.song_count,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  } catch (e) {
    console.error('[setlists/list]', e);
    res.status(500).json({ message: 'Error al cargar setlists' });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  const { name } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const result = await query(
      `INSERT INTO setlists (user_id, name) VALUES ($1, $2)
       RETURNING id, name, created_at, updated_at`,
      [req.userId!, name.trim().slice(0, 120)],
    );
    const row = result.rows[0];
    res.status(201).json({ id: row.id, name: row.name, songCount: 0, createdAt: row.created_at, updatedAt: row.updated_at });
  } catch (e) {
    console.error('[setlists/create]', e);
    res.status(500).json({ message: 'Error al crear setlist' });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
  try {
    const setlist = await query('SELECT * FROM setlists WHERE id = $1 AND user_id = $2', [id, req.userId!]);
    if (!setlist.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }

    const songs = await query(
      `SELECT s.*, ss.position, u.username AS author
       FROM setlist_songs ss
       JOIN songs s ON s.id = ss.song_id
       LEFT JOIN users u ON u.id = s.user_id
       WHERE ss.setlist_id = $1
       ORDER BY ss.position ASC`,
      [id],
    );
    const sl = setlist.rows[0];
    res.json({
      id: sl.id, name: sl.name, createdAt: sl.created_at, updatedAt: sl.updated_at, shareToken: sl.share_token || null,
      songs: songs.rows.map((r) => ({ ...serializeSong(r), position: r.position })),
    });
  } catch (e) {
    console.error('[setlists/get]', e);
    res.status(500).json({ message: 'Error al cargar setlist' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { name } = req.body ?? {};
  if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ message: 'El nombre es requerido' });
    return;
  }
  try {
    const result = await query(
      'UPDATE setlists SET name = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING id',
      [name.trim().slice(0, 120), id, req.userId!],
    );
    if (!result.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }
    res.json({ message: 'Renombrada' });
  } catch (e) {
    console.error('[setlists/update]', e);
    res.status(500).json({ message: 'Error al renombrar setlist' });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
  try {
    const result = await query('DELETE FROM setlists WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId!]);
    if (!result.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }
    res.json({ message: 'Eliminada' });
  } catch (e) {
    console.error('[setlists/delete]', e);
    res.status(500).json({ message: 'Error al eliminar setlist' });
  }
});

router.post('/:id/songs', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { songId } = req.body ?? {};
  if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
  if (!songId) { res.status(400).json({ message: 'songId requerido' }); return; }

  try {
    const ownership = await query('SELECT id FROM setlists WHERE id = $1 AND user_id = $2', [id, req.userId!]);
    if (!ownership.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }

    const positionResult = await query(
      'SELECT COALESCE(MAX(position), 0) + 1 AS next FROM setlist_songs WHERE setlist_id = $1',
      [id],
    );
    const position = positionResult.rows[0].next;

    await query(
      `INSERT INTO setlist_songs (setlist_id, song_id, position) VALUES ($1, $2, $3)
       ON CONFLICT (setlist_id, song_id) DO NOTHING`,
      [id, songId, position],
    );
    await query('UPDATE setlists SET updated_at = NOW() WHERE id = $1', [id]);
    res.status(201).json({ message: 'Agregada' });
  } catch (e) {
    console.error('[setlists/add-song]', e);
    res.status(500).json({ message: 'Error al agregar canción' });
  }
});

router.delete('/:id/songs/:songId', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const songId = parseInt(req.params.songId, 10);
  if (Number.isNaN(id) || Number.isNaN(songId)) { res.status(400).json({ message: 'ID inválido' }); return; }
  try {
    const ownership = await query('SELECT id FROM setlists WHERE id = $1 AND user_id = $2', [id, req.userId!]);
    if (!ownership.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }
    await query('DELETE FROM setlist_songs WHERE setlist_id = $1 AND song_id = $2', [id, songId]);
    await query('UPDATE setlists SET updated_at = NOW() WHERE id = $1', [id]);
    res.json({ message: 'Quitada' });
  } catch (e) {
    console.error('[setlists/remove-song]', e);
    res.status(500).json({ message: 'Error al quitar canción' });
  }
});

router.put('/:id/order', async (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { songIds } = req.body ?? {};
  if (Number.isNaN(id)) { res.status(400).json({ message: 'ID inválido' }); return; }
  if (!Array.isArray(songIds)) { res.status(400).json({ message: 'songIds debe ser un array' }); return; }

  try {
    const ownership = await query('SELECT id FROM setlists WHERE id = $1 AND user_id = $2', [id, req.userId!]);
    if (!ownership.rows.length) { res.status(404).json({ message: 'Setlist no encontrada' }); return; }

    for (let i = 0; i < songIds.length; i++) {
      await query(
        'UPDATE setlist_songs SET position = $1 WHERE setlist_id = $2 AND song_id = $3',
        [i + 1, id, songIds[i]],
      );
    }
    await query('UPDATE setlists SET updated_at = NOW() WHERE id = $1', [id]);
    res.json({ message: 'Reordenada' });
  } catch (e) {
    console.error('[setlists/reorder]', e);
    res.status(500).json({ message: 'Error al reordenar' });
  }
});

export default router;
