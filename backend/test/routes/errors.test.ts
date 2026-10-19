import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);
const token = () => jwt.sign({ userId: 1, username: 'u' }, process.env.JWT_SECRET!, { expiresIn: '1h' });

describe('error handling', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('answers 400 instead of crashing on a non-numeric song id', async () => {
    mockedQuery.mockRejectedValueOnce(Object.assign(new Error('invalid input syntax for type integer'), { code: '22P02' }));

    const response = await request(app)
      .post('/api/songs/abc/chords')
      .set('Authorization', `Bearer ${token()}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it('answers 500 when a route throws outside its own try/catch', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('db down'));

    const response = await request(app)
      .post('/api/songs/1/chords')
      .set('Authorization', `Bearer ${token()}`)
      .send({});

    expect(response.status).toBe(500);
    expect(response.body.message).toBeTruthy();
  });
});

describe('health', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('reports ok when the database answers', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ '?column?': 1 }] } as never);

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', db: 'ok' });
  });

  it('reports 503 when the database is down', async () => {
    mockedQuery.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(503);
    expect(response.body.db).toBe('down');
  });
});
