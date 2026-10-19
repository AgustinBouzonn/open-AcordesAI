import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const vercel = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
const nginx = readFileSync(resolve(root, 'nginx.conf'), 'utf8');

describe('vercel.json', () => {
  it('manda los mismos headers de seguridad que nginx (self-hosting)', () => {
    const fromNginx = Object.fromEntries(
      [...nginx.matchAll(/add_header ([\w-]+) "([^"]+)" always;/g)].map(([, key, value]) => [key, value]),
    );
    const global = vercel.headers.find((h: { source: string }) => h.source === '/(.*)');
    const fromVercel = Object.fromEntries(global.headers.map((h: { key: string; value: string }) => [h.key, h.value]));
    expect(Object.keys(fromNginx).length).toBeGreaterThan(0);
    expect(fromVercel).toEqual(fromNginx);
  });

  it('manda /api/* a la función antes del fallback de la SPA', () => {
    const sources = vercel.rewrites.map((r: { source: string; destination: string }) => `${r.source} -> ${r.destination}`);
    expect(sources).toEqual(['/api/(.*) -> /api', '/(.*) -> /index.html']);
    for (const fn of Object.keys(vercel.functions)) expect(existsSync(resolve(root, fn)), fn).toBe(true);
  });

  it('solo construye producción (los previews compartirían la base de producción)', () => {
    expect(vercel.ignoreCommand).toBe('[ "$VERCEL_ENV" != production ]');
    expect(readFileSync(resolve(root, vercel.buildCommand.replace(/^bash /, '')), 'utf8')).toContain('npm --prefix backend run migrate');
  });
});
