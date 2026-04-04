import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { query } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { FRONTEND_URL, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET } from '../env';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

type OAuthProvider = 'google' | 'github';

const OAUTH_COOKIE = 'oauth_state';

const parseCookies = (cookieHeader?: string): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

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

const getFrontendUrl = (req: Request): string => {
  if (FRONTEND_URL) {
    return FRONTEND_URL.replace(/\/$/, '');
  }

  return `${req.protocol}://${req.get('host')}`.replace(/\/$/, '');
};

const getOAuthConfig = (provider: OAuthProvider, req: Request) => {
  const callbackUrl = `${req.protocol}://${req.get('host')}/api/auth/oauth/${provider}/callback`;

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

const buildJwt = (user: { id: number; username: string }) => jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

const toUserDto = (user: { id: number; email: string; username: string; auth_provider?: string | null }) => ({
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
    if (!exists.rows.length) {
      return candidate;
    }
  }

  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
};

const upsertOAuthUser = async ({
  email,
  username,
  provider,
  providerId,
}: {
  email: string;
  username: string;
  provider: OAuthProvider;
  providerId: string;
}) => {
  const normalizedEmail = email.toLowerCase();
  const existingByProvider = await query(
    'SELECT id, email, username, auth_provider FROM users WHERE auth_provider = $1 AND auth_provider_id = $2',
    [provider, providerId]
  );

  if (existingByProvider.rows.length) {
    return existingByProvider.rows[0];
  }

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

const redirectWithAuthResult = (req: Request, res: Response, params: Record<string, string>) => {
  const redirectUrl = new URL(`${getFrontendUrl(req)}/#/auth/callback`);
  Object.entries(params).forEach(([key, value]) => redirectUrl.searchParams.set(key, value));
  res.clearCookie(OAUTH_COOKIE, { httpOnly: true, sameSite: 'lax', secure: req.secure });
  res.redirect(redirectUrl.toString());
};

router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    res.status(400).json({ message: 'Email, nombre de usuario y contraseña son requeridos' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }

  try {
    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (exists.rows.length) {
      res.status(409).json({ message: 'Ya existe una cuenta con ese email' });
      return;
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username',
      [email.toLowerCase(), username.trim(), hash]
    );

    const user = result.rows[0];
    const token = buildJwt(user);
    res.status(201).json({ user: toUserDto(user), token });
  } catch (e) {
    console.error('[auth/register]', e);
    res.status(500).json({ message: 'Error al registrar usuario' });
  }
});

router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email y contraseña son requeridos' });
    return;
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ message: 'Email o contraseña incorrectos' });
      return;
    }

    const token = buildJwt(user);
    res.json({ user: toUserDto(user), token });
  } catch (e) {
    console.error('[auth/login]', e);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.get('/oauth/:provider/start', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider as OAuthProvider;
  if (provider !== 'google' && provider !== 'github') {
    res.status(404).json({ message: 'Proveedor no soportado' });
    return;
  }

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

  res.cookie(OAUTH_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(authorizeUrl.toString());
});

router.get('/oauth/:provider/callback', async (req: Request, res: Response): Promise<void> => {
  const provider = req.params.provider as OAuthProvider;
  if (provider !== 'google' && provider !== 'github') {
    res.status(404).json({ message: 'Proveedor no soportado' });
    return;
  }

  const state = typeof req.query.state === 'string' ? req.query.state : '';
  const code = typeof req.query.code === 'string' ? req.query.code : '';
  const cookies = parseCookies(req.headers.cookie);

  if (!code || !state || cookies[OAUTH_COOKIE] !== state) {
    redirectWithAuthResult(req, res, { error: 'No se pudo validar la autenticación social' });
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

    if (!tokenResponse.ok) {
      throw new Error(`oauth token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json() as { access_token?: string };
    if (!tokenData.access_token) {
      throw new Error('oauth token missing');
    }

    let email = '';
    let username = '';
    let providerId = '';

    if (provider === 'google') {
      const userResponse = await fetch(config.userUrl, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const userData = await userResponse.json() as { sub?: string; email?: string; name?: string; given_name?: string };
      email = userData.email || '';
      username = userData.name || userData.given_name || userData.email?.split('@')[0] || 'google-user';
      providerId = userData.sub || '';
    } else {
      const userResponse = await fetch(config.userUrl, {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'AcordesAI',
          Accept: 'application/vnd.github+json',
        },
      });
      const userData = await userResponse.json() as { id?: number; login?: string; name?: string; email?: string };
      providerId = userData.id?.toString() || '';
      username = userData.name || userData.login || 'github-user';
      email = userData.email || '';

      if (!email) {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'User-Agent': 'AcordesAI',
            Accept: 'application/vnd.github+json',
          },
        });
        const emails = await emailResponse.json() as Array<{ email?: string; primary?: boolean; verified?: boolean }>;
        email = emails.find((item) => item.primary && item.verified)?.email
          || emails.find((item) => item.verified)?.email
          || emails[0]?.email
          || '';
      }
    }

    if (!email || !providerId) {
      throw new Error('oauth profile incomplete');
    }

    const user = await upsertOAuthUser({ email, username, provider, providerId });
    const token = buildJwt(user);
    redirectWithAuthResult(req, res, { token });
  } catch (e) {
    console.error(`[auth/oauth/${provider}]`, e);
    redirectWithAuthResult(req, res, { error: 'No se pudo completar la autenticación social' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT id, email, username, auth_provider FROM users WHERE id = $1', [req.userId!]);
    if (!result.rows.length) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json({ user: toUserDto(result.rows[0]) });
  } catch (e) {
    console.error('[auth/me]', e);
    res.status(500).json({ message: 'Error' });
  }
});

router.get('/stats', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'No autorizado' });
      return;
    }

    const [songsCreated, favorites, views] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM songs WHERE user_id = $1', [userId]),
      query('SELECT COUNT(*)::int AS count FROM favorites WHERE user_id = $1', [userId]),
      query(
        `SELECT COALESCE(COUNT(h.*), 0)::int AS count
         FROM songs s
         LEFT JOIN history h ON h.song_id = s.id
         WHERE s.user_id = $1`,
        [userId]
      ),
    ]);

    res.json({
      songsCreated: songsCreated.rows[0]?.count ?? 0,
      favorites: favorites.rows[0]?.count ?? 0,
      views: views.rows[0]?.count ?? 0,
    });
  } catch (e) {
    console.error('[auth/stats]', e);
    res.status(500).json({ message: 'Error al cargar estadísticas' });
  }
});

export default router;
