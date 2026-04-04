import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);
const token = jwt.sign({ userId: 10, username: 'history-user' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

describe('history routes', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('returns history using the requested limit', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'song-2', title: 'Recent Song', artist: 'Artist', viewed_at: '2026-04-04T00:00:00.000Z' }] } as never);

    const response = await request(app)
      .get('/api/history?limit=10')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: 'song-2', title: 'Recent Song', artist: 'Artist', viewedAt: '2026-04-04T00:00:00.000Z' }]);
    expect(mockedQuery).toHaveBeenCalledWith(expect.stringContaining('LIMIT $2'), [10, 10]);
  });

  it('records a viewed song with upsert semantics', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);

    const response = await request(app)
      .post('/api/history/song-2')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ message: 'View recorded' });
    expect(mockedQuery).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT (user_id, song_id) DO UPDATE SET viewed_at = NOW()'), [10, 'song-2']);
  });
});
