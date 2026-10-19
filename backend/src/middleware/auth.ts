import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../env';
import { isSessionCurrent } from '../services/sessions';

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
  userId?: number;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'No autorizado', code: 'NO_TOKEN' });
    return;
  }

  let payload: { userId: number; username: string; tv?: number };
  try {
    payload = jwt.verify(token, JWT_SECRET) as typeof payload;
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: 'Sesión expirada', code: 'TOKEN_EXPIRED' });
      return;
    }
    if (e instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Token inválido', code: 'TOKEN_INVALID' });
      return;
    }
    console.error('[auth] verify failed', e);
    res.status(401).json({ message: 'Token inválido', code: 'TOKEN_INVALID' });
    return;
  }

  if (!(await isSessionCurrent(payload.userId, payload.tv ?? 0))) {
    res.status(401).json({ message: 'Sesión cerrada, volvé a entrar', code: 'TOKEN_REVOKED' });
    return;
  }
  req.user = { id: payload.userId, username: payload.username };
  req.userId = payload.userId;
  next();
};
