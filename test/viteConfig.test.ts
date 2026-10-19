import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

// Regresión: con `pdf: ['jspdf']` en manualChunks, Rollup metía el preload helper de Vite en el chunk de
// jspdf (porque jspdf hace import() internos) y el entry lo importaba estáticamente: index.html hacía
// modulepreload de ~380 KB que solo sirven para exportar a PDF. Encima ese chunk estaba en globIgnores,
// así que offline el entry no podía resolver su import y la app no arrancaba.
// Se lee el archivo como texto: importar vite.config.ts arrastra esbuild, que no corre bajo jsdom.
const source = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf8');

describe('vite build config', () => {
  it('no agrupa jspdf en un manualChunk (debe cargarse solo con import() al exportar)', () => {
    const manualChunks = source.match(/manualChunks:\s*\{([\s\S]*?)\}/)?.[1];
    expect(manualChunks).toBeDefined();
    expect(manualChunks).not.toMatch(/['"]jspdf['"]/);
  });

  it('deja fuera del precache solo los chunks de la exportación a PDF', () => {
    const globIgnores = source.match(/globIgnores:\s*\[([^\]]*)\]/)?.[1] ?? '';
    expect(globIgnores).toContain('**/assets/jspdf*.js');
    expect(globIgnores).not.toMatch(/index-|Page|SongViewer|Tuner|Metronome|react-vendor|icons/);
  });
});
