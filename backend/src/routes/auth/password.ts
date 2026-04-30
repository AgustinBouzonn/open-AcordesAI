import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../../db';
import { authLimiter } from '../../middleware/rateLimit';
import { buildJwt, toUserDto } from './utils';

const router = Router();

const MIN_PASSWORD_LENGTH = 8;
const DUMMY_HASH = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.5O0p3.S6.r5J7CjC6zYj6wJYK.qK';

router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    res.status(400).json({ message: 'Email, nombre de usuario y contraseña son requeridos' });
    return;
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({ message: `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres` });
    return;
  }

  try {
    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) {
      res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email.toLowerCase(), username.trim(), hash]
    );
    const user = result.rows[0];
    res.status(201).json({ user: toUserDto(user), token: buildJwt(user) });
  } catch (e) {
    console.error('[auth/register]', e);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: 'Email y contraseña son requeridos' });
    return;
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    const hash = user?.password_hash || DUMMY_HASH;
    const ok = await bcrypt.compare(password, hash);
    if (!user || !ok) {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
      return;
    }
    res.json({ user: toUserDto(user), token: buildJwt(user) });
  } catch (e) {
    console.error('[auth/login]', e);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

export default router;
