import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app';
import { createSong, createUser, pool, resetDb } from './db';

describe('setlists + ratings against Postgres', () => {
  let user: { id: number; token: string };
  let other: { id: number; token: string };
  let songs: number[];

  beforeEach(async () => {
    await resetDb();
    user = await createUser('alice');
    other = await createUser('mallory');
    songs = [
      await createSong('A', 'X', user.id),
      await createSong('B', 'X', user.id),
      await createSong('C', 'X', user.id),
    ];
  });

  afterAll(async () => {
    await pool.end();
  });

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });

  it('creates a setlist, adds songs and reorders them', async () => {
    const created = await request(app).post('/api/setlists').set(auth(user.token)).send({ name: 'Show' });
    expect(created.status).toBe(201);
    const id = created.body.id;

    for (const songId of songs) {
      const r = await request(app).post(`/api/setlists/${id}/songs`).set(auth(user.token)).send({ songId });
      expect(r.status).toBe(201);
    }
    // Duplicado: no se agrega dos veces.
    await request(app).post(`/api/setlists/${id}/songs`).set(auth(user.token)).send({ songId: songs[0] });

    const reorder = await request(app).put(`/api/setlists/${id}/order`).set(auth(user.token)).send({ songIds: [...songs].reverse() });
    expect(reorder.status).toBe(200);

    const got = await request(app).get(`/api/setlists/${id}`).set(auth(user.token));
    expect(got.body.songs.map((s: { id: number }) => s.id)).toEqual([...songs].reverse());

    const list = await request(app).get('/api/setlists').set(auth(user.token));
    expect(list.body[0]).toMatchObject({ id, songCount: 3 });
  });

  it("does not expose or modify another user's setlist", async () => {
    const { body } = await request(app).post('/api/setlists').set(auth(user.token)).send({ name: 'Privada' });
    expect((await request(app).get(`/api/setlists/${body.id}`).set(auth(other.token))).status).toBe(404);
    expect((await request(app).post(`/api/setlists/${body.id}/songs`).set(auth(other.token)).send({ songId: songs[0] })).status).toBe(404);
    expect((await request(app).put(`/api/setlists/${body.id}/order`).set(auth(other.token)).send({ songIds: [] })).status).toBe(404);
  });

  it('shares a setlist through a public token', async () => {
    const { body } = await request(app).post('/api/setlists').set(auth(user.token)).send({ name: 'Pública' });
    await request(app).post(`/api/setlists/${body.id}/songs`).set(auth(user.token)).send({ songId: songs[1] });

    const share = await request(app).post(`/api/setlists/${body.id}/share`).set(auth(user.token));
    expect(share.status).toBe(200);
    const token = share.body.token ?? share.body.shareToken;
    expect(token).toMatch(/^[a-f0-9]{32}$/);

    const pub = await request(app).get(`/api/setlists/public/${token}`);
    expect(pub.status).toBe(200);
    expect(pub.body).toMatchObject({ name: 'Pública', owner: 'alice' });
    expect(pub.body.songs.map((s: { id: number }) => s.id)).toEqual([songs[1]]);

    await request(app).delete(`/api/setlists/${body.id}/share`).set(auth(user.token));
    expect((await request(app).get(`/api/setlists/public/${token}`)).status).toBe(404);
  });

  it('keeps one rating per user and song', async () => {
    await request(app).post(`/api/ratings/${songs[0]}`).set(auth(user.token)).send({ score: 2 });
    await request(app).post(`/api/ratings/${songs[0]}`).set(auth(user.token)).send({ score: 5 });
    await request(app).post(`/api/ratings/${songs[0]}`).set(auth(other.token)).send({ score: 4 });

    const r = await request(app).get(`/api/ratings/${songs[0]}`);
    expect(r.body).toEqual({ average: '4.5', count: 2 });
  });
});
