import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../env';

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
  userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'No autorizado', code: 'NO_TOKEN' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number; username: string };
    req.user = { id: payload.userId, username: payload.username };
    req.userId = payload.userId;
    next();
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
  }
};
