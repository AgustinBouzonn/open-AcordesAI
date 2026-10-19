import request from 'supertest';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import app from '../../src/app';
import { createSong, createUser, pool, resetDb } from './db';

// recordSignal no bloquea el request: esperamos a que el INSERT aparezca.
async function events(kind: string): Promise<Array<Record<string, unknown>>> {
  for (let i = 0; i < 20; i++) {
    const r = await pool.query('SELECT detail FROM product_events WHERE kind = $1 ORDER BY id', [kind]);
    if (r.rows.length) return r.rows.map((row) => row.detail);
    await new Promise((res) => setTimeout(res, 25));
  }
  return [];
}

describe('product signals against Postgres', () => {
  let user: { id: number; token: string };
  const fetchMock = vi.fn();

  beforeEach(async () => {
    await resetDb();
    user = await createUser('alice');
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  afterAll(async () => {
    await pool.end();
  });

  const auth = () => ({ Authorization: `Bearer ${user.token}` });

  it('records imports from hosts outside the allowlist (host only, no path)', async () => {
    await request(app).post('/api/import/from-url').set(auth()).send({ url: 'https://www.lacuerda.net/tabs/o/oasis/wonderwall.shtml?x=1' });

    expect(await events('import_failed')).toEqual([
      { endpoint: 'from-url', reason: 'host_not_allowed', host: 'www.lacuerda.net', path: '' },
    ]);
  });

  it('records pages where the parser found no chords', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html><body>nada</body></html>', { status: 200 }));

    const r = await request(app).post('/api/import/from-url').set(auth()).send({ url: 'https://www.cifraclub.com/oasis/wonderwall/?utm_source=x' });

    expect(r.status).toBe(422);
    expect(await events('import_failed')).toEqual([
      { endpoint: 'from-url', reason: 'no_content', host: 'www.cifraclub.com', path: '/oasis/wonderwall' },
    ]);
  });

  it('records empty local searches, truncated and lowercased', async () => {
    await request(app).get('/api/search/local?q=Canción Que No Existe En Ningún Lado De Verdad');

    const ev = await events('search_empty');
    expect(ev).toHaveLength(1);
    expect(ev[0]).toMatchObject({ source: 'local' });
    expect(String(ev[0].q)).toBe('canción que no existe en ningún lado de ');
  });

  it('tags imported chords and records when the author corrects them', async () => {
    const chords = 'C G Am F\n'.repeat(20);
    fetchMock.mockResolvedValueOnce(new Response(`<pre class="cifra">${chords}</pre><meta property="og:title" content="Wonderwall - Oasis">`, { status: 200 }));

    const imported = await request(app).post('/api/import/from-url').set(auth()).send({ url: 'https://www.cifraclub.com/oasis/wonderwall/' });
    expect(imported.status).toBe(201);
    const songId = imported.body.song.id;
    const origin = await pool.query('SELECT origin FROM chord_cache WHERE song_id = $1', [songId]);
    expect(origin.rows[0].origin).toBe('import');

    const saved = await request(app).put(`/api/songs/${songId}/chords`).set(auth()).send({ chords: 'Em G D A' });
    expect(saved.status).toBe(200);

    expect(await events('chords_edited')).toEqual([
      { from: 'import', model: null, instrument: 'guitar', source: 'cifraclub' },
    ]);
    const after = await pool.query('SELECT origin FROM chord_cache WHERE song_id = $1', [songId]);
    expect(after.rows[0].origin).toBe('user');
  });

  it('does not record an edit when the chords were already the user\'s', async () => {
    const songId = await createSong('Mía', 'Yo', user.id);
    await request(app).put(`/api/songs/${songId}/chords`).set(auth()).send({ chords: 'C' });
    await request(app).put(`/api/songs/${songId}/chords`).set(auth()).send({ chords: 'D' });

    const r = await pool.query("SELECT count(*)::int AS n FROM product_events WHERE kind = 'chords_edited'");
    expect(r.rows[0].n).toBe(0);
  });
});
