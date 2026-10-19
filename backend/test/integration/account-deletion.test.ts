import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import app from '../../src/app';
import { createSong, createUser, pool, rate, resetDb } from './db';

describe('DELETE /api/auth/me against Postgres', () => {
  beforeEach(async () => {
    await resetDb();
  });

  afterAll(async () => {
    await pool.end();
  });

  const auth = (t: string) => ({ Authorization: `Bearer ${t}` });
  const count = async (sql: string, params: unknown[]) => Number((await pool.query(sql, params)).rows[0].count);

  it('requires the explicit confirmation', async () => {
    const user = await createUser('alice');
    const r = await request(app).delete('/api/auth/me').set(auth(user.token)).send({});
    expect(r.status).toBe(400);
    expect(await count('SELECT COUNT(*) FROM users WHERE id = $1', [user.id])).toBe(1);
  });

  it('deletes the user and personal data but keeps their songs for the community', async () => {
    const user = await createUser('alice');
    const other = await createUser('bob');
    const songId = await createSong('Mine', 'X', user.id);
    await pool.query('INSERT INTO favorites (user_id, song_id) VALUES ($1, $2)', [user.id, songId]);
    await pool.query('INSERT INTO history (user_id, song_id) VALUES ($1, $2)', [user.id, songId]);
    await pool.query(`INSERT INTO comments (user_id, song_id, content) VALUES ($1, $2, 'hola')`, [user.id, songId]);
    await pool.query(`INSERT INTO setlists (user_id, name) VALUES ($1, 'Show')`, [user.id]);
    await rate(user.id, songId, 5);
    await rate(other.id, songId, 3);

    const r = await request(app).delete('/api/auth/me').set(auth(user.token)).send({ confirm: 'ELIMINAR' });
    expect(r.status).toBe(200);

    expect(await count('SELECT COUNT(*) FROM users WHERE id = $1', [user.id])).toBe(0);
    for (const table of ['favorites', 'history', 'comments', 'setlists', 'ratings']) {
      expect(await count(`SELECT COUNT(*) FROM ${table} WHERE user_id = $1`, [user.id])).toBe(0);
    }
    const song = await pool.query('SELECT user_id FROM songs WHERE id = $1', [songId]);
    expect(song.rows[0].user_id).toBeNull();
    expect(await count('SELECT COUNT(*) FROM ratings WHERE user_id = $1', [other.id])).toBe(1);

    // La sesión de la cuenta borrada deja de valer en el acto.
    const again = await request(app).get('/api/auth/me').set(auth(user.token));
    expect(again.status).toBe(401);
    expect(again.body.code).toBe('TOKEN_REVOKED');
  });
});
