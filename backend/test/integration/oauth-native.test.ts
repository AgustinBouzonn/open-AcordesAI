import crypto from 'crypto';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import app from '../../src/app';
import { createUser, pool, resetDb } from './db';

// El código del login nativo se canjea una sola vez y vence: lo garantiza el UPDATE condicional
// contra la tabla real, así que se prueba con Postgres.

const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const insertCode = async (code: string, userId: number, expiresInSeconds: number) => {
  await pool.query(
    'INSERT INTO oauth_native_codes (code_hash, user_id, expires_at) VALUES ($1, $2, NOW() + make_interval(secs => $3))',
    [sha256(code), userId, expiresInSeconds],
  );
};

const exchange = (code: string) => request(app).post('/api/auth/oauth/native/exchange').send({ code });

describe('canje del código de login nativo', () => {
  beforeEach(async () => {
    await resetDb();
    await pool.query('TRUNCATE oauth_native_codes');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('se canjea una sola vez', async () => {
    const { id } = await createUser('nativo');
    await insertCode('codigo-valido', id, 120);

    const first = await exchange('codigo-valido');
    expect(first.status).toBe(200);
    expect(first.body.user.id).toBe(id);

    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${first.body.token}`);
    expect(me.status).toBe(200);

    const second = await exchange('codigo-valido');
    expect(second.status).toBe(400);
    expect(second.body.token).toBeUndefined();
  });

  it('un código vencido no sirve', async () => {
    const { id } = await createUser('vencido');
    await insertCode('codigo-vencido', id, -1);

    const response = await exchange('codigo-vencido');
    expect(response.status).toBe(400);
  });

  it('un código inexistente no sirve', async () => {
    const response = await exchange('no-existe');
    expect(response.status).toBe(400);
  });
});
