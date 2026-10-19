import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app';
import { addChords, createSong, createUser, pool, rate, resetDb } from './db';

describe('songs + search against Postgres', () => {
  let ids: Record<string, number>;

  beforeEach(async () => {
    await resetDb();
    const alice = await createUser('alice');
    const bob = await createUser('bob');
    ids = {
      wonderwall: await createSong('Wonderwall', 'Oasis', alice.id, '2026-01-01'),
      champagne: await createSong('Champagne Supernova', 'Oasis', alice.id, '2026-01-02'),
      wonder: await createSong('Wonderful Tonight', 'Eric Clapton', bob.id, '2026-01-03'),
      yellow: await createSong('Yellow', 'Coldplay', bob.id, '2026-01-04'),
    };
    await rate(alice.id, ids.wonderwall, 5);
    await rate(bob.id, ids.wonderwall, 4);
    await addChords(ids.wonderwall);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('health reports the database as ok', async () => {
    const r = await request(app).get('/api/health');
    expect(r.status).toBe(200);
    expect(r.body.db).toBe('ok');
  });

  it('GET /api/songs aggregates ratings and chords per song', async () => {
    const r = await request(app).get('/api/songs?q=wonderwall');
    expect(r.status).toBe(200);
    expect(r.body).toHaveLength(1);
    expect(r.body[0]).toMatchObject({ id: ids.wonderwall, author: 'alice', ratingCount: '2' });
    expect(Number(r.body[0].rating)).toBeCloseTo(4.5);
    expect(Number(r.body[0].hasChords)).toBe(1);
  });

  it('GET /api/songs leaves unrated songs without rating', async () => {
    const r = await request(app).get('/api/songs?q=yellow');
    expect(r.body[0].rating ?? null).toBeNull();
    expect(r.body[0].ratingCount).toBe('0');
  });

  it('GET /api/songs ranks title matches before artist matches, newest first on ties', async () => {
    const bob = (await pool.query("SELECT id FROM users WHERE username = 'bob'")).rows[0].id;
    // Más nueva que todas, pero solo coincide por artista: tiene que quedar última.
    const byArtist = await createSong('Talk Tonight', 'Wonder Band', bob, '2026-02-01');

    const r = await request(app).get('/api/songs?q=wonder');
    // Wonderful Tonight y Wonderwall empatan (título empieza con "wonder"): gana la más nueva.
    expect(r.body.map((s: { id: number }) => s.id)).toEqual([ids.wonder, ids.wonderwall, byArtist]);
  });

  it('GET /api/songs paginates with limit/offset in a stable order', async () => {
    const all = (await request(app).get('/api/songs?limit=10')).body.map((s: { id: number }) => s.id);
    const page2 = (await request(app).get('/api/songs?limit=2&offset=2')).body.map((s: { id: number }) => s.id);
    expect(all).toEqual([ids.yellow, ids.wonder, ids.champagne, ids.wonderwall]);
    expect(page2).toEqual(all.slice(2, 4));
  });

  it('GET /api/search/local finds by title or artist', async () => {
    const r = await request(app).get('/api/search/local?q=oasis');
    expect(r.status).toBe(200);
    expect(r.body.results.map((s: { id: number }) => s.id).sort()).toEqual([ids.wonderwall, ids.champagne].sort());
  });
});
