import 'dotenv/config';

const requireEnv = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} must be configured`);
  }
  return value;
};

const requireStrongSecret = (name: string): string => {
  const value = requireEnv(name);
  if (value.length < 32 || /^changeme/i.test(value)) {
    throw new Error(`${name} must be a strong secret`);
  }
  return value;
};

export const DATABASE_URL = requireEnv('DATABASE_URL');
export const JWT_SECRET = requireStrongSecret('JWT_SECRET');
export const PORT = Number(process.env.PORT || 3001);

export const FRONTEND_URL = process.env.FRONTEND_URL?.trim() || '';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim() || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim() || '';
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID?.trim() || '';
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET?.trim() || '';

if (process.env.NODE_ENV !== 'test') {
  const groups: Array<{ name: string; vars: Record<string, string>; mode?: 'all' | 'any' }> = [
    { name: 'Google OAuth', vars: { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } },
    { name: 'GitHub OAuth', vars: { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } },
    { name: 'AI provider', vars: { GEMINI_API_KEY: process.env.GEMINI_API_KEY?.trim() || '', OPENAI_API_KEY: process.env.OPENAI_API_KEY?.trim() || '' }, mode: 'any' },
  ];
  for (const g of groups) {
    const entries = Object.entries(g.vars);
    const filled = entries.filter(([, v]) => v).map(([k]) => k);
    const missing = entries.filter(([, v]) => !v).map(([k]) => k);
    const enabled = g.mode === 'any' ? filled.length > 0 : missing.length === 0;
    if (enabled) console.log(`[env] ${g.name}: enabled (${filled.join(', ')})`);
    else if (filled.length && g.mode !== 'any') console.warn(`[env] ${g.name}: partial — missing ${missing.join(', ')}, disabled`);
    else console.log(`[env] ${g.name}: disabled`);
  }
  if (!FRONTEND_URL) console.warn('[env] FRONTEND_URL not set — OAuth callbacks will use the request Host');
}
