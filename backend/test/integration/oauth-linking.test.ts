import request from 'supertest';
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.GITHUB_CLIENT_ID = 'gh-id';
  process.env.GITHUB_CLIENT_SECRET = 'gh-secret';
});

import app from '../../src/app';
import { pool, resetDb } from './db';

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

describe('OAuth linking to a pre-registered password account', () => {
  const fetchMock = vi.fn();

  beforeEach(async () => {
    await resetDb();
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  afterAll(async () => {
    await pool.end();
  });

  const githubLogin = async (email: string) => {
    fetchMock
      .mockResolvedValueOnce(json({ access_token: 'tok' }))
      .mockResolvedValueOnce(json({ id: 77, login: 'victim' }))
      .mockResolvedValueOnce(json([{ email, primary: true, verified: true }]));
    vi.stubGlobal('fetch', fetchMock);
    const r = await request(app)
      .get('/api/auth/oauth/github/callback?code=c&state=s')
      .set('Cookie', 'oauth_state=s');
    vi.unstubAllGlobals();
    return r;
  };

  it('invalidates the password set by whoever registered the email first', async () => {
    // El atacante registra el email de la víctima con su propia contraseña.
    const reg = await request(app).post('/api/auth/register').send({ email: 'victim@test.com', username: 'squatter', password: 'attacker-pass' });
    expect(reg.status).toBe(201);

    // La víctima entra por primera vez con GitHub (email verificado): se vincula a esa cuenta.
    const oauth = await githubLogin('victim@test.com');
    expect(oauth.headers.location).toContain('token=');

    // La contraseña del atacante ya no sirve.
    const login = await request(app).post('/api/auth/login').send({ email: 'victim@test.com', password: 'attacker-pass' });
    expect(login.status).toBe(401);
  });

  it('keeps the password of an account that was already linked to a provider', async () => {
    await githubLogin('owner@test.com'); // cuenta creada por OAuth
    const before = await pool.query("SELECT password_hash FROM users WHERE email = 'owner@test.com'");

    await githubLogin('owner@test.com'); // segundo login: entra por (provider, provider_id)
    const after = await pool.query("SELECT password_hash FROM users WHERE email = 'owner@test.com'");
    expect(after.rows[0].password_hash).toBe(before.rows[0].password_hash);
  });
});
