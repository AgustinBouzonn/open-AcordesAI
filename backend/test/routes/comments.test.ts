import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);
const token = jwt.sign({ userId: 3, username: 'commenter' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

describe('comment routes', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
  });

  it('rejects unauthenticated comment creation', async () => {
    const response = await request(app).post('/api/comments/song-1').send({ content: 'Hola' });
    expect(response.status).toBe(401);
  });

  it('creates a trimmed comment with normalized response shape', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{ id: 11, song_id: 'song-1', user_id: 3, content: 'Hola', created_at: '2026-04-04T00:00:00.000Z' }],
    } as never);

    const response = await request(app)
      .post('/api/comments/song-1')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '  Hola  ' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 11,
      songId: 'song-1',
      userId: 3,
      username: 'commenter',
      content: 'Hola',
      createdAt: '2026-04-04T00:00:00.000Z',
    });
  });
});
