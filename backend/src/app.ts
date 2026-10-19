import express, { NextFunction, Request, Response } from 'express';
// Captura rechazos de handlers async y los manda al error handler (Express 4 no lo hace solo).
import 'express-async-errors';
import cors from 'cors';
import authRouter from './routes/auth';
import searchRouter from './routes/search';
import songsRouter from './routes/songs';
import favoritesRouter from './routes/favorites';
import historyRouter from './routes/history';
import commentsRouter from './routes/comments';
import importRouter from './routes/import';
import ratingsRouter from './routes/ratings';
import setlistsRouter from './routes/setlists';
import progressRouter from './routes/progress';
import practiceRouter from './routes/practice';
import recommendationsRouter from './routes/recommendations';
import { query } from './db';

const app = express();

app.set('trust proxy', 1);
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',').map(origin => origin.trim()).filter(Boolean) || false }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/import', importRouter);
app.use('/api/songs', songsRouter());
app.use('/api/favorites', favoritesRouter());
app.use('/api/history', historyRouter());
app.use('/api/comments', commentsRouter());
app.use('/api/ratings', ratingsRouter());
app.use('/api/setlists', setlistsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/practice', practiceRouter);
app.use('/api/recommendations', recommendationsRouter);

app.get('/api/health', async (_, res) => {
  const aiConfigured = Boolean(
    process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
  );
  try {
    await Promise.race([
      query('SELECT 1'),
      new Promise((_r, reject) => setTimeout(() => reject(new Error('db timeout')), 2000)),
    ]);
  } catch (e) {
    console.error('[health] db check failed', e);
    res.status(503).json({ status: 'error', db: 'down', aiConfigured });
    return;
  }
  res.json({ status: 'ok', db: 'ok', aiConfigured });
});

// Último recurso: errores no capturados en las rutas responden JSON en vez de tirar el proceso.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  // 22P02 = invalid_text_representation (p. ej. /api/songs/abc con columna integer).
  if ((err as { code?: string })?.code === '22P02') {
    res.status(400).json({ message: 'Parámetro inválido' });
    return;
  }
  console.error(`[unhandled] ${req.method} ${req.path}`, err);
  if (res.headersSent) return;
  res.status(500).json({ message: 'Error interno' });
});

export default app;
