import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);

describe('rate limiting', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('shares auth limiter across login and register by IP', async () => {
    const ip = '198.51.100.10';

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const response = await request(app)
        .post('/api/auth/login')
        .set('X-Forwarded-For', ip)
        .send({});

      expect(response.status).toBe(400);
    }

    const blocked = await request(app)
      .post('/api/auth/register')
      .set('X-Forwarded-For', ip)
      .send({});

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ message: 'Demasiados intentos de autenticación. Intenta de nuevo más tarde.' });
  });

  it('shares import limiter across search and fetch by IP', async () => {
    const ip = '198.51.100.11';

    for (let attempt = 0; attempt < 20; attempt += 1) {
      const response = await request(app)
        .get('/api/import/search/ultimateguitar')
        .set('X-Forwarded-For', ip);

      expect(response.status).toBe(400);
    }

    const blocked = await request(app)
      .post('/api/import/fetch')
      .set('X-Forwarded-For', ip)
      .send({});

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ message: 'Demasiadas importaciones. Intenta de nuevo más tarde.' });
  });

  it('limits chord generation by authenticated user instead of only IP', async () => {
    mockedQuery.mockResolvedValue({ rows: [] } as never);

    const ip = '198.51.100.12';
    const userAToken = jwt.sign({ userId: 101, username: 'user-a' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    const userBToken = jwt.sign({ userId: 202, username: 'user-b' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    for (let attempt = 0; attempt < 15; attempt += 1) {
      const response = await request(app)
        .post('/api/songs/song-1/chords')
        .set('Authorization', `Bearer ${userAToken}`)
        .set('X-Forwarded-For', ip)
        .send({ instrument: 'guitar' });

      expect(response.status).toBe(404);
    }

    const blocked = await request(app)
      .post('/api/songs/song-1/chords')
      .set('Authorization', `Bearer ${userAToken}`)
      .set('X-Forwarded-For', ip)
      .send({ instrument: 'guitar' });

    expect(blocked.status).toBe(429);
    expect(blocked.body).toEqual({ message: 'Demasiadas generaciones de cifrados. Intenta de nuevo más tarde.' });

    const otherUser = await request(app)
      .post('/api/songs/song-1/chords')
      .set('Authorization', `Bearer ${userBToken}`)
      .set('X-Forwarded-For', ip)
      .send({ instrument: 'guitar' });

    expect(otherUser.status).toBe(404);
  });
});
