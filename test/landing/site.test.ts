import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { buildChordEntries, chordSlug, describeShape, GUITAR_STRINGS, noteToSpanish } from '../../landing/build/chords';
import { classifyTitle, groupByMonth } from '../../landing/build/changelog';
import { buildSite, parseFragment } from '../../landing/build/site';

describe('chord dictionary data', () => {
  it('builds clean slugs and Spanish names', () => {
    expect(chordSlug('C#')).toBe('c-sostenido');
    expect(chordSlug('Cmaj7')).toBe('cmaj7');
    expect(noteToSpanish('A#')).toBe('La sostenido');
    expect(noteToSpanish('Bb')).toBe('Si bemol');
  });

  it('gives every guitar chord its notes and a unique slug', () => {
    const entries = buildChordEntries();
    expect(entries.length).toBeGreaterThan(30);
    expect(new Set(entries.map((e) => e.slug)).size).toBe(entries.length);
    const am = entries.find((e) => e.name === 'Am')!;
    expect(am.spanishName).toBe('La menor');
    expect(am.notes).toEqual(['A', 'C', 'E']);
    expect(am.ukulele).not.toBeNull();
    expect(entries.find((e) => e.name === 'C#')!.altName).toBe('Db');
  });

  it('describes each string of a shape', () => {
    const am = buildChordEntries().find((e) => e.name === 'Am')!;
    const lines = describeShape(am.guitar, GUITAR_STRINGS);
    expect(lines[0]).toBe('Cuerda 6ª (Mi grave): no se toca');
    expect(lines[1]).toBe('Cuerda 5ª (La): al aire');
    expect(lines[4]).toBe('Cuerda 2ª (Si): traste 1, dedo índice');
  });
});

describe('changelog', () => {
  it('classifies conventional and Jules titles', () => {
    expect(classifyTitle('fix(ui) + docs: 4 bugs de la app')).toEqual({ kind: 'Arreglo', text: '4 bugs de la app' });
    expect(classifyTitle('feat(landing): landing estática')).toEqual({ kind: 'Nuevo', text: 'Landing estática' });
    expect(classifyTitle('ci: Postgres real')).toEqual({ kind: 'Interno', text: 'Postgres real' });
    expect(classifyTitle('🛡️ Sentinel: [HIGH] Fix prompt injection')).toEqual({ kind: 'Arreglo', text: 'Fix prompt injection' });
    expect(classifyTitle('⚡ Bolt: optimize favorites')).toEqual({ kind: 'Mejora', text: 'Optimize favorites' });
    expect(classifyTitle('Harden backend flows')).toEqual({ kind: 'Mejora', text: 'Harden backend flows' });
  });

  it('groups by month, newest first, and folds dependency bumps into a count', () => {
    const months = groupByMonth([
      { number: 1, title: 'feat: a', url: 'u1', author: 'ana', mergedAt: '2026-09-02T10:00:00Z' },
      { number: 3, title: 'fix: c', url: 'u3', author: 'ana', mergedAt: '2026-10-05T10:00:00Z' },
      { number: 2, title: 'Bump x', url: 'u2', author: 'dependabot[bot]', mergedAt: '2026-10-01T10:00:00Z' },
    ]);
    expect(months.map((m) => m.label)).toEqual(['Octubre de 2026', 'Septiembre de 2026']);
    expect(months[0].items.map((i) => i.number)).toEqual([3]);
    expect(months[0].dependencyUpdates).toBe(1);
  });
});

describe('buildSite (offline)', () => {
  const out = mkdtempSync(join(tmpdir(), 'landing-'));
  afterAll(() => rmSync(out, { recursive: true, force: true }));

  it('reads page metadata from the leading comment', () => {
    const { meta, body } = parseFragment('<!--\ntitle: Hola\ndescription: Algo: con dos puntos\n-->\n<p>x</p>');
    expect(meta).toEqual({ title: 'Hola', description: 'Algo: con dos puntos' });
    expect(body).toBe('<p>x</p>');
  });

  it('renders every page with resolved variables, working relative links and a sitemap', async () => {
    const repoRoot = resolve(__dirname, '../..');
    const { pages } = await buildSite({ repoRoot, outDir: out, siteUrl: 'https://example.test/sub/', repo: 'o/r', offline: true });

    for (const p of ['index.html', 'privacidad.html', 'terminos.html', 'ayuda.html', 'estado.html', 'novedades.html', 'acordes/index.html', 'acordes/am.html']) {
      expect(pages).toContain(p);
    }
    for (const p of pages) {
      const html = readFileSync(join(out, p), 'utf8');
      expect(html, p).not.toMatch(/\{\{\w+\}\}/);
      expect(html, p).toContain('<title>');
      // Cada enlace relativo apunta a un archivo que existe en el sitio.
      for (const [, href] of html.matchAll(/(?:href|src)="([^"#:]+)(?:#[^"]*)?"/g)) {
        if (!href || href.startsWith('//') || p === '404.html') continue;
        const target = resolve(join(out, p, '..'), href);
        const file = href.endsWith('/') ? join(target, 'index.html') : target;
        expect(readdirSync(join(file, '..')), `${p} → ${href}`).toContain(file.split('/').pop());
      }
    }

    const index = readFileSync(join(out, 'index.html'), 'utf8');
    expect(index).toContain('https://acordesai.bthings.com.ar/downloads/acordesai.apk');
    expect(index).toContain('href="acordes/am.html"');
    const am = readFileSync(join(out, 'acordes/am.html'), 'utf8');
    expect(am).toContain('<link rel="canonical" href="https://example.test/sub/acordes/am.html">');
    expect((am.match(/<svg/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(readFileSync(join(out, 'sitemap.xml'), 'utf8')).not.toContain('404.html');

    // Traducciones de la portada: idioma correcto, hreflang en las tres y enlaces relativos que funcionan.
    for (const [file, lang] of [['index.html', 'es'], ['en/index.html', 'en'], ['pt/index.html', 'pt']]) {
      const html = readFileSync(join(out, file), 'utf8');
      expect(html, file).toContain(`<html lang="${lang}">`);
      expect(html, file).toContain('<link rel="alternate" hreflang="pt" href="https://example.test/sub/pt/">');
    }
    expect(readFileSync(join(out, 'en/index.html'), 'utf8')).toContain('href="../acordes/am.html"');
  });
});

describe('key pages', () => {
  it('spells the diatonic chords of a sharp and a flat key', async () => {
    const { buildKey } = await import('../../landing/build/keys');
    expect(buildKey('G').chords.map((c) => c.label)).toEqual(['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#°']);
    expect(buildKey('Bb').chords.map((c) => c.label)).toEqual(['Bb', 'Cm', 'Dm', 'Eb', 'F', 'Gm', 'A°']);
    // F# mayor: la sensible es E#, pero el diagrama es el de F°7.
    const fs = buildKey('F#').chords[6];
    expect(fs).toMatchObject({ label: 'E#°', lookup: 'Fdim7' });
  });

  it('links every chord to a dictionary page and suggests capo positions', async () => {
    const { buildKeys, buildKey } = await import('../../landing/build/keys');
    const names = new Set(buildChordEntries().map((e) => e.name));
    for (const k of buildKeys()) {
      for (const c of [...k.chords, k.dominantSeventh]) expect(names.has(c.lookup), `${k.tonic}: ${c.label}`).toBe(true);
    }
    expect(buildKey('G').capo).toEqual([{ capo: 3, shapes: 'E' }, { capo: 5, shapes: 'D' }, { capo: 7, shapes: 'C' }]);
    expect(buildKey('G').progressions[0].chords.map((c) => c.label)).toEqual(['G', 'D', 'Em', 'C']);
  });
});
