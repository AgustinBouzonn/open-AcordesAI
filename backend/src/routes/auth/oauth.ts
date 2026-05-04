import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { authLimiter } from '../../middleware/rateLimit';
import {
  OAUTH_COOKIE,
  OAuthProvider,
  buildJwt,
  getOAuthConfig,
  redirectWithAuthResult,
  upsertOAuthUser,
  parseCookies,
} from './utils';

const router = Router();

const isValidProvider = (value: string): value is OAuthProvider => value === 'google' || value === 'github';

router.get('/oauth/:provider/start', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider;
  if (!isValidProvider(provider)) { res.status(404).json({ message: 'Proveedor no soportado' }); return; }

  const config = getOAuthConfig(provider, req);
  if (!config.clientId || !config.clientSecret) {
    res.status(503).json({ message: `OAuth de ${provider} no está configurado` });
    return;
  }

  const state = crypto.randomUUID();
  const authorizeUrl = new URL(config.authorizeUrl);
  authorizeUrl.searchParams.set('client_id', config.clientId);
  authorizeUrl.searchParams.set('redirect_uri', config.callbackUrl);
  authorizeUrl.searchParams.set('scope', config.scope);
  authorizeUrl.searchParams.set('state', state);
  if (provider === 'google') {
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('access_type', 'offline');
    authorizeUrl.searchParams.set('prompt', 'consent');
  }

  res.cookie(OAUTH_COOKIE, state, { httpOnly: true, sameSite: 'none', secure: true, maxAge: 10 * 60 * 1000 });
  res.redirect(302, authorizeUrl.toString());
});

async function handleOAuthCallback(provider: OAuthProvider, req: Request, res: Response): Promise<void> {
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const code = typeof req.query.code === 'string' ? req.query.code : '';

  const cookies = parseCookies(req.headers.cookie);
  const storedState = cookies[OAUTH_COOKIE];

  if (!code || !state || state !== storedState) {
    redirectWithAuthResult(req, res, { error: 'No se pudo completar la autenticación social (estado inválido)' });
    return;
  }

  try {
    const config = getOAuthConfig(provider, req);
    if (!config.clientId || !config.clientSecret) {
      redirectWithAuthResult(req, res, { error: `OAuth de ${provider} no está configurado` });
      return;
    }

    const tokenResponse = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: provider === 'github'
        ? { 'Content-Type': 'application/json', Accept: 'application/json' }
        : { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: provider === 'github'
        ? JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, code, redirect_uri: config.callbackUrl, state })
        : new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, code, redirect_uri: config.callbackUrl, grant_type: 'authorization_code' }).toString(),
    });
    if (!tokenResponse.ok) throw new Error(`oauth token exchange failed: ${tokenResponse.status}`);
    const tokenData = await tokenResponse.json() as { access_token?: string };
    if (!tokenData.access_token) throw new Error('oauth token missing');

    let email = '';
    let username = '';
    let providerId = '';

    if (provider === 'google') {
      const r = await fetch(config.userUrl, { headers: { Authorization: `Bearer ${tokenData.access_token}` } });
      const u = await r.json() as { sub?: string; email?: string; name?: string; given_name?: string };
      email = u.email || '';
      username = u.name || u.given_name || u.email?.split('@')[0] || 'google-user';
      providerId = u.sub || '';
    } else {
      const r = await fetch(config.userUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AcordesAI', Accept: 'application/vnd.github+json' },
      });
      const u = await r.json() as { id?: number; login?: string; name?: string; email?: string };
      providerId = u.id?.toString() || '';
      username = u.name || u.login || 'github-user';
      email = u.email || '';
      if (!email) {
        const er = await fetch('https://api.github.com/user/emails', {
          headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AcordesAI', Accept: 'application/vnd.github+json' },
        });
        const list = await er.json() as Array<{ email?: string; primary?: boolean; verified?: boolean }>;
        email = list.find((i) => i.primary && i.verified)?.email
          || list.find((i) => i.verified)?.email
          || list[0]?.email || '';
      }
    }

    if (!email || !providerId) throw new Error('oauth profile incomplete');

    const user = await upsertOAuthUser({ email, username, provider, providerId });
    redirectWithAuthResult(req, res, { token: buildJwt(user) });
  } catch (e) {
    console.error(`[auth/oauth/${provider}]`, e);
    redirectWithAuthResult(req, res, { error: `No se pudo completar la autenticación con ${provider}` });
  }
}

router.get('/oauth/:provider/callback', async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider;
  if (!isValidProvider(provider)) { res.status(404).json({ message: 'Proveedor no soportado' }); return; }
  await handleOAuthCallback(provider, req, res);
});

router.get('/google/callback', (req, res) => handleOAuthCallback('google', req, res));
router.get('/github/callback', (req, res) => handleOAuthCallback('github', req, res));

export default router;
