import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);

const token = () => jwt.sign({ userId: 9, username: 'practice-user' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

describe('practice routes', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('rejects unauthenticated POST', async () => {
    const res = await request(app).post('/api/practice').send({ songId: 1, durationSec: 60 });
    expect(res.status).toBe(401);
  });

  it('rejects invalid duration', async () => {
    const res = await request(app)
      .post('/api/practice')
      .set('Authorization', `Bearer ${token()}`)
      .send({ songId: 1, durationSec: 1 });
    expect(res.status).toBe(400);
  });

  it('rejects missing song', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never);
    const res = await request(app)
      .post('/api/practice')
      .set('Authorization', `Bearer ${token()}`)
      .send({ songId: 999, durationSec: 60 });
    expect(res.status).toBe(404);
  });

  it('records a session', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ '?column?': 1 }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    const res = await request(app)
      .post('/api/practice')
      .set('Authorization', `Bearer ${token()}`)
      .send({ songId: 5, durationSec: 120 });
    expect(res.status).toBe(201);
  });

  it('returns aggregated stats', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ total_sec: 600, sessions: 5, unique_songs: 2 }] } as never)
      .mockResolvedValueOnce({ rows: [{ day: '2026-04-01', sec: 300 }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);
    const res = await request(app)
      .get('/api/practice/stats')
      .set('Authorization', `Bearer ${token()}`);
    expect(res.status).toBe(200);
    expect(res.body.totalSec).toBe(600);
    expect(res.body.sessions).toBe(5);
    expect(Array.isArray(res.body.byDay)).toBe(true);
  });
});
