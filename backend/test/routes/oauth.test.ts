import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
  process.env.GITHUB_CLIENT_ID = 'gh-id';
  process.env.GITHUB_CLIENT_SECRET = 'gh-secret';
  process.env.GOOGLE_CLIENT_ID = 'g-id';
  process.env.GOOGLE_CLIENT_SECRET = 'g-secret';
});

vi.mock('../../src/db', () => ({
  query: vi.fn(),
}));

import app from '../../src/app';
import { query } from '../../src/db';

const mockedQuery = vi.mocked(query);
const fetchMock = vi.fn();

const json = (body: unknown) => ({ ok: true, status: 200, json: async () => body });

const authResult = (location: string | undefined) => {
  const qs = (location || '').split('#/auth/callback?')[1] || '';
  return Object.fromEntries(new URLSearchParams(qs));
};

describe('oauth callback', () => {
  beforeEach(() => {
    mockedQuery.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sets the state cookie on /start', async () => {
    const response = await request(app).get('/api/auth/oauth/github/start');

    expect(response.status).toBe(302);
    const state = new URL(response.headers.location).searchParams.get('state');
    expect(state).toBeTruthy();
    expect(String(response.headers['set-cookie'])).toContain(`oauth_state=${state}`);
  });

  it('rejects a callback without the state cookie', async () => {
    const response = await request(app).get('/api/auth/oauth/github/callback?code=abc&state=attacker');

    expect(response.status).toBe(302);
    expect(authResult(response.headers.location).error).toBeTruthy();
    expect(authResult(response.headers.location).token).toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a callback whose state does not match the cookie', async () => {
    const response = await request(app)
      .get('/api/auth/oauth/github/callback?code=abc&state=attacker')
      .set('Cookie', 'oauth_state=legit-state');

    expect(authResult(response.headers.location).error).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs in with GitHub when state matches and the email is verified', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ access_token: 'tok' }))
      .mockResolvedValueOnce(json({ id: 42, login: 'octo', email: 'public@test.com' }))
      .mockResolvedValueOnce(json([
        { email: 'unverified@test.com', primary: false, verified: false },
        { email: 'octo@test.com', primary: true, verified: true },
      ]));
    mockedQuery.mockResolvedValueOnce({ rows: [{ id: 1, email: 'octo@test.com', username: 'octo' }] } as never);

    const response = await request(app)
      .get('/api/auth/oauth/github/callback?code=abc&state=s1')
      .set('Cookie', 'oauth_state=s1');

    expect(authResult(response.headers.location).token).toBeTypeOf('string');
  });

  it('does not link accounts through an unverified GitHub email', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ access_token: 'tok' }))
      .mockResolvedValueOnce(json({ id: 42, login: 'octo', email: null }))
      .mockResolvedValueOnce(json([{ email: 'victim@test.com', primary: true, verified: false }]));

    const response = await request(app)
      .get('/api/auth/oauth/github/callback?code=abc&state=s1')
      .set('Cookie', 'oauth_state=s1');

    expect(authResult(response.headers.location).error).toBeTruthy();
    expect(mockedQuery).not.toHaveBeenCalled();
  });

  it('does not link accounts through an unverified Google email', async () => {
    fetchMock
      .mockResolvedValueOnce(json({ access_token: 'tok' }))
      .mockResolvedValueOnce(json({ sub: 'g-1', email: 'victim@test.com', email_verified: false, name: 'X' }));

    const response = await request(app)
      .get('/api/auth/oauth/google/callback?code=abc&state=s1')
      .set('Cookie', 'oauth_state=s1');

    expect(authResult(response.headers.location).error).toBeTruthy();
    expect(mockedQuery).not.toHaveBeenCalled();
  });
});
