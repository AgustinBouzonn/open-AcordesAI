import express from 'express';
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

app.get('/api/health', (_, res) => {
  const aiConfigured = Boolean(
    process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY,
  );
  res.json({ status: 'ok', aiConfigured });
});

export default app;
