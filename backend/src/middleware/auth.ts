import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
  userId?: number;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

const parseTokenPayload = (token: string): { userId: number; username: string } =>
  jwt.verify(token, JWT_SECRET) as { userId: number; username: string };

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    res.status(401).json({ message: 'No autorizado' });
    return;
  }

  try {
    const payload = parseTokenPayload(token);
    req.user = { id: payload.userId, username: payload.username };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

export const attachOptionalUser = (req: AuthRequest, _: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    next();
    return;
  }

  try {
    const payload = parseTokenPayload(token);
    req.user = { id: payload.userId, username: payload.username };
    req.userId = payload.userId;
  } catch {
    req.user = undefined;
    req.userId = undefined;
  }

  next();
};

export const getRequiredUser = (req: AuthRequest): { id: number; username: string } => {
  if (!req.user) {
    throw new Error('Authenticated user missing on request');
  }

  return req.user;
};
