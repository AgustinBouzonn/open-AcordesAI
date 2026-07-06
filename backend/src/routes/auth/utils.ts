import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../../db';
import { FRONTEND_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET } from '../../env';

export type OAuthProvider = 'google' | 'github';

export const OAUTH_COOKIE = 'oauth_state';

export const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) return {};
  // ⚡ Bolt: Use manual string parsing and object construction to prevent multiple map/filter array allocations
  const result: Record<string, string> = {};
  const pairs = cookieHeader.split(';');
  for (let i = 0; i < pairs.length; i++) {
    const entry = pairs[i].trim();
    if (!entry) continue;
    const eqIdx = entry.indexOf('=');
    if (eqIdx === -1) {
      result[entry] = '';
    } else {
      const key = entry.slice(0, eqIdx);
      const val = entry.slice(eqIdx + 1);
      result[key] = decodeURIComponent(val);
    }
  }
  return result;
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

export const buildJwt = (user: { id: number; username: string }) =>
  jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

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
    'SELECT id, email, username, auth_provider FROM users WHERE auth_provider = $1 AND auth_provider_id = $2',
    [provider, providerId]
  );
  if (existingByProvider.rows.length) return existingByProvider.rows[0];

  const existingByEmail = await query(
    'SELECT id, email, username, auth_provider FROM users WHERE email = $1',
    [normalizedEmail]
  );
  if (existingByEmail.rows.length) {
    const updated = await query(
      `UPDATE users
       SET auth_provider = COALESCE(auth_provider, $1),
           auth_provider_id = COALESCE(auth_provider_id, $2)
       WHERE id = $3
       RETURNING id, email, username, auth_provider`,
      [provider, providerId, existingByEmail.rows[0].id]
    );
    return updated.rows[0];
  }

  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);
  const uniqueUsername = await ensureUniqueUsername(username);
  const inserted = await query(
    `INSERT INTO users (email, username, password_hash, auth_provider, auth_provider_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username, auth_provider`,
    [normalizedEmail, uniqueUsername, passwordHash, provider, providerId]
  );
  return inserted.rows[0];
};

export const redirectWithAuthResult = (req: Request, res: Response, params: Record<string, string>) => {
  const frontendUrl = getFrontendUrl(req);
  const queryString = new URLSearchParams(params).toString();
  res.clearCookie(OAUTH_COOKIE, { httpOnly: true, sameSite: 'none', secure: true });
  res.redirect(`${frontendUrl}/#/auth/callback?${queryString}`);
};
