import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { authLimiter } from '../../middleware/rateLimit';
import { query } from '../../db';
import {
  NATIVE_CODE_TTL_SECONDS,
  OAUTH_COOKIE,
  OAUTH_COOKIE_OPTIONS,
  OAUTH_NATIVE_COOKIE,
  OAuthProvider,
  buildJwt,
  getOAuthConfig,
  hashNativeCode,
  isNativeOAuthFlow,
  parseCookies,
  redirectWithAuthResult,
  toUserDto,
  upsertOAuthUser,
} from './utils';

const router = Router();

const isValidProvider = (value: string): value is OAuthProvider => value === 'google' || value === 'github';

const safeEqual = (a: string, b: string): boolean => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

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

  const cookieOptions = { ...OAUTH_COOKIE_OPTIONS, maxAge: 10 * 60 * 1000 };
  res.cookie(OAUTH_COOKIE, state, cookieOptions);
  // Solo marca el flujo como nativo: a dónde se vuelve lo decide NATIVE_APP_SCHEME, no el cliente.
  if (req.query.platform === 'native') res.cookie(OAUTH_NATIVE_COOKIE, '1', cookieOptions);
  else res.clearCookie(OAUTH_NATIVE_COOKIE, OAUTH_COOKIE_OPTIONS);
  res.redirect(302, authorizeUrl.toString());
});

async function handleOAuthCallback(provider: OAuthProvider, req: Request, res: Response): Promise<void> {
  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  if (!code || !state) {
    redirectWithAuthResult(req, res, { error: 'No se pudo completar la autenticación social' });
    return;
  }

  try {
    // El state tiene que coincidir con la cookie seteada en /start (protección CSRF).
    const expectedState = parseCookies(req.headers.cookie)[OAUTH_COOKIE] || '';
    if (!expectedState || !safeEqual(state, expectedState)) {
      redirectWithAuthResult(req, res, { error: 'La sesión de autenticación expiró o no es válida. Intentá de nuevo.' });
      return;
    }

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
      const u = await r.json() as { sub?: string; email?: string; email_verified?: boolean; name?: string; given_name?: string };
      // Solo emails verificados: upsertOAuthUser vincula cuentas existentes por email.
      email = u.email_verified === true ? u.email || '' : '';
      username = u.name || u.given_name || u.email?.split('@')[0] || 'google-user';
      providerId = u.sub || '';
    } else {
      const r = await fetch(config.userUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AcordesAI', Accept: 'application/vnd.github+json' },
      });
      const u = await r.json() as { id?: number; login?: string; name?: string; email?: string };
      providerId = u.id?.toString() || '';
      username = u.name || u.login || 'github-user';
      // /user devuelve el email público sin indicar si está verificado; se toma de /user/emails.
      const er = await fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'AcordesAI', Accept: 'application/vnd.github+json' },
      });
      const list = er.ok ? await er.json() as Array<{ email?: string; primary?: boolean; verified?: boolean }> : [];
      email = list.find((i) => i.primary && i.verified)?.email
        || list.find((i) => i.verified)?.email
        || '';
    }

    if (!email || !providerId) throw new Error('oauth profile incomplete');

    const user = await upsertOAuthUser({ email, username, provider, providerId });
    if (isNativeOAuthFlow(req)) {
      redirectWithAuthResult(req, res, { code: await issueNativeCode(user.id) });
      return;
    }
    redirectWithAuthResult(req, res, { token: buildJwt(user) });
  } catch (e) {
    console.error(`[auth/oauth/${provider}]`, e);
    redirectWithAuthResult(req, res, { error: `No se pudo completar la autenticación con ${provider}` });
  }
}

/** Crea un código de un solo uso para la app nativa. Se guarda solo su hash; de paso purga los vencidos. */
async function issueNativeCode(userId: number): Promise<string> {
  const code = crypto.randomBytes(32).toString('base64url');
  await query(
    `WITH purge AS (DELETE FROM oauth_native_codes WHERE expires_at < NOW())
     INSERT INTO oauth_native_codes (code_hash, user_id, expires_at)
     VALUES ($1, $2, NOW() + make_interval(secs => $3))`,
    [hashNativeCode(code), userId, NATIVE_CODE_TTL_SECONDS]
  );
  return code;
}

// La app nativa canjea el código del deep link por la sesión. El UPDATE marca el código como usado
// y comprueba que no esté usado ni vencido en una sola sentencia, así no se puede canjear dos veces.
router.post('/oauth/native/exchange', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const code = typeof req.body?.code === 'string' ? req.body.code : '';
  if (!code || code.length > 200) { res.status(400).json({ message: 'Código de autenticación inválido' }); return; }

  try {
    const used = await query(
      `UPDATE oauth_native_codes SET used_at = NOW()
       WHERE code_hash = $1 AND used_at IS NULL AND expires_at > NOW()
       RETURNING user_id`,
      [hashNativeCode(code)]
    );
    if (!used.rows.length) { res.status(400).json({ message: 'El código de autenticación expiró o ya se usó. Intentá de nuevo.' }); return; }

    const result = await query(
      'SELECT id, email, username, auth_provider, token_version FROM users WHERE id = $1',
      [used.rows[0].user_id]
    );
    const user = result.rows[0];
    if (!user) { res.status(400).json({ message: 'El código de autenticación expiró o ya se usó. Intentá de nuevo.' }); return; }
    res.json({ user: toUserDto(user), token: buildJwt(user) });
  } catch (e) {
    console.error('[auth/oauth/native/exchange]', e);
    res.status(500).json({ message: 'No se pudo completar el inicio de sesión' });
  }
});

router.get('/oauth/:provider/callback', async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider;
  if (!isValidProvider(provider)) { res.status(404).json({ message: 'Proveedor no soportado' }); return; }
  await handleOAuthCallback(provider, req, res);
});

router.get('/google/callback', (req, res) => handleOAuthCallback('google', req, res));
router.get('/github/callback', (req, res) => handleOAuthCallback('github', req, res));

export default router;
