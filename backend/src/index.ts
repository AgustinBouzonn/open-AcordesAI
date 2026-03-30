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
import { requireAuth } from './middleware/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/search', searchRouter);
app.use('/api/import', importRouter);
app.use('/api/songs', songsRouter());
app.use('/api/favorites', requireAuth, favoritesRouter());
app.use('/api/history', requireAuth, historyRouter());
app.use('/api/comments', commentsRouter());
app.use('/api/ratings', ratingsRouter());

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
