#!/usr/bin/env node
// Agrega una medición al historial de la página de estado y lo recorta a 30 días.
//
//   node scripts/status-record.mjs <history.json> <ok:true|false> <http_code> <ms>
//
// Formato: { "checks": [[epochSeg, 1|0, ms, código], ...] } (compacto: ~2900 filas en 30 días).
// Imprime cuántas mediciones seguidas fallaron al final, para que status.yml abra o cierre el incidente.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const [file, ok, code, ms] = process.argv.slice(2);
if (!file || !['true', 'false'].includes(ok)) {
  console.error('uso: status-record.mjs <history.json> <true|false> <code> <ms>');
  process.exit(2);
}

const KEEP_SECONDS = 30 * 86400;
const now = Math.floor(Date.now() / 1000);

let checks = [];
if (existsSync(file)) {
  try {
    checks = JSON.parse(readFileSync(file, 'utf8')).checks ?? [];
  } catch {
    checks = []; // historial roto: se empieza de nuevo antes que dejar de medir
  }
}

checks.push([now, ok === 'true' ? 1 : 0, Number(ms) || 0, Number(code) || 0]);
checks = checks.filter((c) => c[0] >= now - KEEP_SECONDS);
writeFileSync(file, JSON.stringify({ updated: now, checks }) + '\n');

let failing = 0;
for (let i = checks.length - 1; i >= 0 && !checks[i][1]; i--) failing++;
console.log(failing);
