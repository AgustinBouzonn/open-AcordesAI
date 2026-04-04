import request from 'supertest';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

vi.mock('../../src/services/aiService', () => ({
  generateChords: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';
import { generateChords } from '../../src/services/aiService';

const mockedQuery = vi.mocked(query);
const mockedGenerateChords = vi.mocked(generateChords);
const ownerToken = jwt.sign({ userId: 5, username: 'owner' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
const otherUserToken = jwt.sign({ userId: 6, username: 'other' }, process.env.JWT_SECRET!, { expiresIn: '7d' });

describe('song routes', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    mockedGenerateChords.mockReset();
  });

  it('filters songs by q and returns normalized fields', async () => {
    mockedQuery.mockResolvedValueOnce({
      rows: [{
        id: 'song-1',
        title: 'Wonderwall',
        artist: 'Oasis',
        author: 'owner',
        rating: '4.5',
        has_chords: 1,
      }],
    } as never);

    const response = await request(app).get('/api/songs?q=wonder');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      id: 'song-1',
      title: 'Wonderwall',
      artist: 'Oasis',
      author: 'owner',
      rating: '4.5',
      hasChords: 1,
    }]);
    expect(mockedQuery).toHaveBeenCalledWith(expect.stringContaining("WHEN LOWER(s.title) LIKE LOWER($1) || '%' THEN 1"), ['wonder', 50, 0]);
  });

  it('returns cached chords for the requested instrument without calling AI', async () => {
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ id: 'song-1', title: 'Song', artist: 'Artist' }] } as never)
      .mockResolvedValueOnce({ rows: [{ content: 'Ukulele chords' }] } as never);

    const response = await request(app)
      .post('/api/songs/song-1/chords')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ instrument: 'ukulele' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ chords: 'Ukulele chords' });
    expect(mockedGenerateChords).not.toHaveBeenCalled();
  });

  it('blocks saving chords for a song owned by another user', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 'song-1', title: 'Song', artist: 'Artist', user_id: 5 }] } as never);

    const response = await request(app)
      .put('/api/songs/song-1/chords')
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ chords: 'C G Am F', instrument: 'guitar' });

    expect(response.status).toBe(403);
  });
});
