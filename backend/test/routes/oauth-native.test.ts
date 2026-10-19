import crypto from 'crypto';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.GITHUB_CLIENT_ID = 'gh-id';
  process.env.GITHUB_CLIENT_SECRET = 'gh-secret';
});

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

// Login social desde la app nativa: Google bloquea OAuth dentro de WebViews y el callback volvía al
// sitio web, no a la app. Ahora el flujo nativo vuelve a un deep link fijo con un código de un solo uso.

const mockedQuery = vi.mocked(query);
const fetchMock = vi.fn();
const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body });
const DEEP_LINK = 'com.acordesai.app://auth/callback';
const sha256 = (value: string) => crypto.createHash('sha256').update(value).digest('hex');

const githubProfile = () => {
  fetchMock
    .mockResolvedValueOnce(json({ access_token: 'tok' }))
    .mockResolvedValueOnce(json({ id: 42, login: 'octo' }))
    .mockResolvedValueOnce(json([{ email: 'octo@test.com', primary: true, verified: true }]));
};

describe('OAuth nativo', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('/start con platform=native marca el flujo con una cookie', async () => {
    const response = await request(app).get('/api/auth/oauth/github/start?platform=native');

    expect(response.status).toBe(302);
    expect(String(response.headers['set-cookie'])).toMatch(/oauth_native=1;.*HttpOnly/);
  });

  it('/start sin platform no marca el flujo nativo', async () => {
    const response = await request(app).get('/api/auth/oauth/github/start');

    expect(String(response.headers['set-cookie'])).not.toContain('oauth_native=1');
  });

  it('el callback nativo vuelve al deep link con un código, nunca con el JWT', async () => {
    githubProfile();
    mockedQuery
      .mockResolvedValueOnce({ rows: [{ id: 7, email: 'octo@test.com', username: 'octo' }] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    const response = await request(app)
      .get('/api/auth/oauth/github/callback?code=abc&state=s1')
      .set('Cookie', 'oauth_state=s1; oauth_native=1');

    const location = response.headers.location as string;
    expect(location.startsWith(`${DEEP_LINK}?code=`)).toBe(true);
    expect(location).not.toContain('token=');
    const code = new URL(location).searchParams.get('code')!;
    expect(code.length).toBeGreaterThanOrEqual(40);

    // Se guarda el hash del código, no el código, con el usuario y un vencimiento corto.
    const [sql, params] = mockedQuery.mock.calls[1] as unknown as [string, unknown[]];
    expect(sql).toContain('INSERT INTO oauth_native_codes');
    expect(params).toEqual([sha256(code), 7, 120]);
  });

  it('un error en el flujo nativo vuelve al deep link con el error', async () => {
    const response = await request(app)
      .get('/api/auth/oauth/github/callback?code=abc&state=attacker')
      .set('Cookie', 'oauth_state=legit; oauth_native=1');

    const location = response.headers.location as string;
    expect(location.startsWith(`${DEEP_LINK}?error=`)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('el flujo web no cambia: vuelve al frontend con el JWT', async () => {
    githubProfile();
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 7, email: 'octo@test.com', username: 'octo' }] } as never);

    const response = await request(app)
      .get('/api/auth/oauth/github/callback?code=abc&state=s1')
      .set('Cookie', 'oauth_state=s1');

    const location = response.headers.location as string;
    expect(location).toContain('#/auth/callback?token=');
    expect(location.startsWith(DEEP_LINK)).toBe(false);
  });

  it('el destino del deep link no lo controla el cliente', async () => {
    const start = await request(app).get('/api/auth/oauth/github/start?platform=native&redirect=https://evil.example&redirect_uri=evil://x');
    expect(new URL(start.headers.location).searchParams.get('redirect_uri')).not.toContain('evil');

    const response = await request(app)
      .get('/api/auth/oauth/github/callback?state=x&redirect=https://evil.example')
      .set('Cookie', 'oauth_state=s1; oauth_native=1');
    expect((response.headers.location as string).startsWith(`${DEEP_LINK}?`)).toBe(true);
  });

  describe('POST /oauth/native/exchange', () => {
    it('canjea un código válido por la sesión', async () => {
      mockedQuery
        .mockResolvedValueOnce({ rows: [{ user_id: 7 }] } as never)
        .mockResolvedValueOnce({ rows: [{ id: 7, email: 'octo@test.com', username: 'octo', auth_provider: 'github', token_version: 0 }] } as never);

      const response = await request(app).post('/api/auth/oauth/native/exchange').send({ code: 'el-codigo' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTypeOf('string');
      expect(response.body.user).toMatchObject({ id: 7, username: 'octo', provider: 'github' });
      const [sql, params] = mockedQuery.mock.calls[0] as unknown as [string, unknown[]];
      expect(params).toEqual([sha256('el-codigo')]);
      // Un solo uso y vencimiento, en la misma sentencia que lo marca como usado.
      expect(sql).toContain('used_at IS NULL');
      expect(sql).toContain('expires_at > NOW()');
    });

    it('rechaza un código usado o vencido', async () => {
      mockedQuery.mockResolvedValueOnce({ rows: [] } as never);

      const response = await request(app).post('/api/auth/oauth/native/exchange').send({ code: 'ya-usado' });

      expect(response.status).toBe(400);
      expect(response.body.token).toBeUndefined();
      expect(mockedQuery).toHaveBeenCalledTimes(1);
    });

    it('rechaza un pedido sin código sin tocar la base', async () => {
      const response = await request(app).post('/api/auth/oauth/native/exchange').send({});

      expect(response.status).toBe(400);
      expect(mockedQuery).not.toHaveBeenCalled();
    });
  });
});
