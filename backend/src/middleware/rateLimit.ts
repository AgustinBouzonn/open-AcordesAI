import { rateLimit } from 'express-rate-limit';
import { Request } from 'express';
import { AuthRequest } from './auth';

const jsonMessage = (message: string) => ({ message });

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Demasiados intentos de autenticación. Intenta de nuevo más tarde.'),
});

export const importLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage('Demasiadas importaciones. Intenta de nuevo más tarde.'),
});

export const chordGenerationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => (req as AuthRequest).user?.id?.toString() || req.ip || 'anonymous',
  message: jsonMessage('Demasiadas generaciones de cifrados. Intenta de nuevo más tarde.'),
});

export const chordSaveLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => (req as AuthRequest).user?.id?.toString() || req.ip || 'anonymous',
  message: jsonMessage('Demasiados guardados de cifrados. Intenta de nuevo más tarde.'),
});
