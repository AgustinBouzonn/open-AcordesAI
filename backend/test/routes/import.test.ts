import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../../src/app';

describe('import routes', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects disallowed URLs before fetching', async () => {
    const response = await request(app).post('/api/import/fetch').send({
      url: 'http://localhost/internal',
      source: 'ultimateguitar',
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'URL no permitida' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('parses chords from an allowed Ultimate Guitar page', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => '<pre class="js-tab-content">C G Am F</pre>',
    });

    const response = await request(app).post('/api/import/fetch').send({
      url: 'https://www.ultimateguitar.com/tabs/test-song',
      source: 'ultimateguitar',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ chords: 'C G Am F' });
  });

  it('returns parsed search results with absolute URLs', async () => {
    fetchMock.mockResolvedValueOnce({
      text: async () => '<a href="/tabs/song-1">Song 1</a>',
    });

    const response = await request(app).get('/api/import/search/ultimateguitar?q=test');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      results: [{
        title: 'Song 1',
        artist: 'Unknown',
        url: 'https://www.ultimateguitar.com/tabs/song-1',
      }],
    });
  });
});
