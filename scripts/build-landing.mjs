#!/usr/bin/env node
// Arma la landing de GitHub Pages en _site/ (o en el directorio que se pase).
//
//   node scripts/build-landing.mjs [outDir] [--offline]
//
// Variables: SITE_URL (URL pública con / final), GITHUB_REPOSITORY, GITHUB_TOKEN (para Novedades y el
// último release; sin token igual funciona con el límite anónimo de la API).
// Usa el module runner de Vite para importar el generador en TSX con los mismos componentes de la app.
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runnerImport } from 'vite';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const outDir = resolve(repoRoot, args.find((a) => !a.startsWith('--')) ?? '_site');
const siteUrl = (process.env.SITE_URL || 'https://agustinbouzonn.github.io/open-AcordesAI/').replace(/\/?$/, '/');

const { module } = await runnerImport(resolve(repoRoot, 'landing/build/site.tsx'), {
  configFile: false,
  root: repoRoot,
  logLevel: 'warn',
});

rmSync(outDir, { recursive: true, force: true });
const { pages } = await module.buildSite({
  repoRoot,
  outDir,
  siteUrl,
  repo: process.env.GITHUB_REPOSITORY || 'AgustinBouzonn/open-AcordesAI',
  token: process.env.GITHUB_TOKEN || undefined,
  offline: args.includes('--offline'),
});
console.log(`[landing] ${pages.length} páginas en ${outDir}`);
