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
