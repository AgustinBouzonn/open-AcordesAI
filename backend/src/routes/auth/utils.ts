import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../../db';
import { FRONTEND_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, NATIVE_APP_SCHEME } from '../../env';

export type OAuthProvider = 'google' | 'github';

export const OAUTH_COOKIE = 'oauth_state';
// Marca que el login empezó desde la app nativa. La setea /start con ?platform=native en el mismo
// navegador (Custom Tabs) que después recibe el callback.
export const OAUTH_NATIVE_COOKIE = 'oauth_native';
export const OAUTH_COOKIE_OPTIONS = { httpOnly: true, sameSite: 'none' as const, secure: true };

export const NATIVE_CALLBACK_URL = `${NATIVE_APP_SCHEME}://auth/callback`;
export const NATIVE_CODE_TTL_SECONDS = 120;

export const hashNativeCode = (code: string): string => crypto.createHash('sha256').update(code).digest('hex');

export const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [key, ...rest] = entry.split('=');
        return [key, decodeURIComponent(rest.join('='))];
      })
  );
};

export const getFrontendUrl = (req: Request): string => {
  if (FRONTEND_URL) return FRONTEND_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
};

export const getOAuthConfig = (provider: OAuthProvider, req: Request) => {
  const callbackUrl = `${getFrontendUrl(req)}/api/auth/oauth/${provider}/callback`;
  if (provider === 'google') {
    return {
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      scope: 'openid email profile',
      callbackUrl,
    };
  }
  return {
    clientId: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userUrl: 'https://api.github.com/user',
    scope: 'read:user user:email',
    callbackUrl,
  };
};

export const buildJwt = (user: { id: number; username: string; token_version?: number }) =>
  jwt.sign({ userId: user.id, username: user.username, tv: user.token_version ?? 0 }, JWT_SECRET, { expiresIn: '7d' });

export const toUserDto = (user: { id: number; email: string; username: string; auth_provider?: string | null }) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  provider: user.auth_provider || undefined,
});

const normalizeUsername = (value: string): string => {
  const base = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9\s._-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
  return base || `user-${crypto.randomUUID().slice(0, 8)}`;
};

const ensureUniqueUsername = async (preferred: string): Promise<string> => {
  const base = normalizeUsername(preferred);
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
    const exists = await query('SELECT id FROM users WHERE username = $1', [candidate]);
    if (!exists.rows.length) return candidate;
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
};

export const upsertOAuthUser = async (params: { email: string; username: string; provider: OAuthProvider; providerId: string }) => {
  const { email, username, provider, providerId } = params;
  const normalizedEmail = email.toLowerCase();
  const existingByProvider = await query(
    'SELECT id, email, username, auth_provider, token_version FROM users WHERE auth_provider = $1 AND auth_provider_id = $2',
    [provider, providerId]
  );
  if (existingByProvider.rows.length) return existingByProvider.rows[0];

  const existingByEmail = await query(
    'SELECT id, email, username, auth_provider FROM users WHERE email = $1',
    [normalizedEmail]
  );
  if (existingByEmail.rows.length) {
    // Una cuenta con contraseña y sin proveedor nunca probó ser dueña del email (/register no lo verifica).
    // Al vincularla al proveedor (que sí verificó el email) se invalida esa contraseña: si la creó otra
    // persona registrando el email de la víctima antes que ella, pierde el acceso, y token_version + 1
    // le corta las sesiones que ya tenía abiertas.
    const rotatedHash = await bcrypt.hash(crypto.randomUUID(), 10);
    const updated = await query(
      `UPDATE users
       SET password_hash = CASE WHEN auth_provider IS NULL THEN $4 ELSE password_hash END,
           token_version = CASE WHEN auth_provider IS NULL THEN token_version + 1 ELSE token_version END,
           auth_provider = COALESCE(auth_provider, $1),
           auth_provider_id = COALESCE(auth_provider_id, $2)
       WHERE id = $3
       RETURNING id, email, username, auth_provider, token_version`,
      [provider, providerId, existingByEmail.rows[0].id, rotatedHash]
    );
    return updated.rows[0];
  }

  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
  const uniqueUsername = await ensureUniqueUsername(username);
  const inserted = await query(
    `INSERT INTO users (email, username, password_hash, auth_provider, auth_provider_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username, auth_provider, token_version`,
    [normalizedEmail, uniqueUsername, passwordHash, provider, providerId]
  );
  return inserted.rows[0];
};

export const isNativeOAuthFlow = (req: Request): boolean => parseCookies(req.headers.cookie)[OAUTH_NATIVE_COOKIE] === '1';

/**
 * Cierra el flujo de OAuth. En la web vuelve al frontend con el JWT en el hash, como siempre.
 * En la app nativa vuelve al deep link fijo: nunca con el JWT, solo con `code` (de un solo uso)
 * o con `error`.
 */
export const redirectWithAuthResult = (req: Request, res: Response, params: Record<string, string>) => {
  const native = isNativeOAuthFlow(req);
  res.clearCookie(OAUTH_COOKIE, OAUTH_COOKIE_OPTIONS);
  res.clearCookie(OAUTH_NATIVE_COOKIE, OAUTH_COOKIE_OPTIONS);
  if (native) {
    const nativeParams: Record<string, string> = params.code
      ? { code: params.code }
      : { error: params.error || 'No se pudo completar la autenticación social' };
    res.redirect(`${NATIVE_CALLBACK_URL}?${new URLSearchParams(nativeParams).toString()}`);
    return;
  }
  const frontendUrl = getFrontendUrl(req);
  const queryString = new URLSearchParams(params).toString();
  res.redirect(`${frontendUrl}/#/auth/callback?${queryString}`);
};
