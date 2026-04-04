import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);
const token = jwt.sign({ userId: 4, username: 'rater' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

describe('rating routes', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('rejects invalid scores', async () => {
    const response = await request(app)
      .post('/api/ratings/song-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ score: 6 });

    expect(response.status).toBe(400);
  });

  it('returns rating summary', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ avg: '4.5', count: '2' }] } as never);

    const response = await request(app).get('/api/ratings/song-1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ average: '4.5', count: 2 });
  });
});
