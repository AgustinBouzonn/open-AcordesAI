import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);
const token = jwt.sign({ userId: 9, username: 'fav-user' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

describe('favorites routes', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('returns the current user favorites', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'song-1', title: 'Song', artist: 'Artist', favorited_at: '2026-04-04T00:00:00.000Z' }] } as never);

    const response = await request(app)
      .get('/api/favorites')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'song-1', title: 'Song', artist: 'Artist', favoritedAt: '2026-04-04T00:00:00.000Z' }]);
  });

  it('adds a favorite for the authenticated user', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);

    const response = await request(app)
      .post('/api/favorites/song-1')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'Added to favorites' });
    expect(mockedQuery).toHaveBeenCalledWith(
      'INSERT INTO favorites (user_id, song_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [9, 'song-1']
    );
  });
});
