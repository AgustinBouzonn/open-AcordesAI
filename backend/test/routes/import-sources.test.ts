import request from 'supertest';
import jwt from 'jsonwebtoken';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/db', () => ({
  query: vi.fn(),
  withTransaction: vi.fn(),
}));

import app from '../../src/app';
import { query, withTransaction } from '../../src/db';

const mockedQuery = vi.mocked(query);
const mockedTx = vi.mocked(withTransaction);
const fetchMock = vi.fn();
const token = () => jwt.sign({ userId: 1, username: 'u' }, process.env.JWT_SECRET!, { expiresIn: '1h' });

const escapeAttr = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Estructura real de una página de tabs.ultimate-guitar.com (contenido sintético).
const ugPage = () => {
  const store = {
    store: {
      page: {
        data: {
          tab: { song_name: 'Wonderwall', artist_name: 'Oasis' },
          tab_view: {
            wiki_tab: {
              content: '[Intro]\r\n[ch]Em7[/ch]   [ch]G[/ch]   [ch]Dsus4[/ch]\r\n\r\n[Verse 1]\r\n[tab][ch]Em7[/ch]      [ch]G[/ch]\r\nToday is gonna be the day that they\'re gonna throw it back to you[/tab]\r\n[tab][ch]Dsus4[/ch]   [ch]A7sus4[/ch]\r\nBy now you should\'ve somehow realized what you gotta do[/tab]',
            },
          },
        },
      },
    },
  };
  return `<html><head><meta property="og:title" content="Oasis - Wonderwall (Chords)"></head>`
    + `<body><div class="js-store" data-content="${escapeAttr(JSON.stringify(store))}"></div></body></html>`;
};

const htmlResponse = (body: string, init: ResponseInit = {}) =>
  new Response(body, { status: 200, headers: { 'content-type': 'text/html' }, ...init });

describe('import: Ultimate Guitar and fetch safety', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    mockedTx.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('accepts tabs.ultimate-guitar.com and parses the js-store tab', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse(ugPage()));

    const response = await request(app).post('/api/import/fetch').send({
      url: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-39144',
    });

    expect(response.status).toBe(200);
    expect(response.body.chords).toContain('Today is gonna be the day');
    expect(response.body.chords).not.toMatch(/\[\/?(ch|tab)\]/);
  });

  it('takes title and artist from the UG JSON, not the inverted og:title', async () => {
    mockedQuery.mockResolvedValueOnce({ rows: [] } as never); // dedup
    let inserted: unknown[] = [];
    mockedTx.mockImplementationOnce(async (fn) => fn({
      query: vi.fn(async (_sql: string, params: unknown[]) => {
        if (!inserted.length) inserted = params;
        return { rows: [{ id: 9, title: params[0], artist: params[1] }] };
      }),
    } as never));
    fetchMock.mockResolvedValueOnce(htmlResponse(ugPage()));

    const response = await request(app)
      .post('/api/import/from-url')
      .set('Authorization', `Bearer ${token()}`)
      .send({ url: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-39144' });

    expect(response.status).toBe(201);
    expect(inserted.slice(0, 2)).toEqual(['Wonderwall', 'Oasis']);
    expect(inserted[3]).toBe('ultimateguitar');
  });

  it('does not follow a redirect to a host outside the allowlist', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'http://169.254.169.254/latest/meta-data' } }));

    const response = await request(app).post('/api/import/fetch').send({
      url: 'https://www.cifraclub.com/oasis/wonderwall/',
    });

    expect(response.status).toBe(502);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('follows redirects that stay inside the allowlist', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 301, headers: { location: 'https://tabs.ultimate-guitar.com/tab/oasis/wonderwall-chords-39144' } }))
      .mockResolvedValueOnce(htmlResponse(ugPage()));

    const response = await request(app).post('/api/import/fetch').send({
      url: 'https://www.ultimate-guitar.com/tab/oasis/wonderwall-chords-39144',
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][1].redirect).toBe('manual');
  });

  it('rejects pages above the size limit', async () => {
    fetchMock.mockResolvedValueOnce(htmlResponse('<pre>' + 'x'.repeat(3 * 1024 * 1024 + 10) + '</pre>'));

    const response = await request(app).post('/api/import/fetch').send({
      url: 'https://www.cifraclub.com/oasis/wonderwall/',
    });

    expect(response.status).toBe(502);
  });
});
