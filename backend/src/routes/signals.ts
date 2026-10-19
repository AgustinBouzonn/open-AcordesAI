import { Router, Request, Response } from 'express';
import { clientErrorLimiter } from '../middleware/rateLimit';
import { recordSignal } from '../services/signals';

const router = Router();

const SOURCES = new Set(['boundary', 'window', 'unhandledrejection']);

// El frontend reporta errores no capturados (services/errorReporter.ts). Se guardan acotados y sin usuario.
router.post('/client-error', clientErrorLimiter, (req: Request, res: Response) => {
  const { message, source, route } = req.body ?? {};
  if (typeof message !== 'string' || !message.trim() || typeof source !== 'string' || !SOURCES.has(source)) {
    res.status(400).json({ message: 'Reporte inválido' });
    return;
  }
  void recordSignal('client_error', {
    source,
    message: message.slice(0, 200),
    route: typeof route === 'string' ? route.split('?')[0].slice(0, 100) : null,
  });
  res.status(204).end();
});

export default router;
