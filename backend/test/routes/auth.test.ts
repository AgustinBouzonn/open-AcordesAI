import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);

describe('auth routes', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('registers a user and returns a token', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [{ id: 1, email: 'user@test.com', username: 'user' }] } as never);

    const response = await request(app).post('/api/auth/register').send({
      email: 'USER@test.com',
      username: 'user',
      password: 'secret123',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('user@test.com');
    expect(response.body.token).toBeTypeOf('string');
  });

  it('returns the current user from /me', async () => {
    const token = jwt.sign({ userId: 7, username: 'tester' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 7, email: 'tester@test.com', username: 'tester' }] } as never);

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      user: { id: 7, email: 'tester@test.com', username: 'tester' },
    });
  });
});
