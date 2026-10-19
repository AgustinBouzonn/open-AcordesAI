// Genera el sitio estático de GitHub Pages en outDir:
//   landing/pages/*.html  → páginas envueltas en el layout común (header, footer, SEO)
//   data/chordShapes.ts   → /acordes/ (índice + una página por acorde, con los diagramas de la app)
//   PRs mergeados         → /novedades.html
//   último GitHub Release → enlace del APK (si no hay release, el del servidor)
// Lo corre scripts/build-landing.mjs (local y en .github/workflows/pages.yml).
import { cpSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChordDiagram } from '../../components/ChordDiagram';
import { UkuleleChordDiagram } from '../../components/UkuleleChordDiagram';
import { PianoChordDiagram } from '../../components/PianoChordDiagram';
import { QUALITIES, GUITAR_STRINGS, UKULELE_STRINGS, buildChordEntries, describeShape, noteToSpanish, type ChordEntry } from './chords';
import { fetchLatestApk, fetchMergedPrs, groupByMonth, type ChangelogMonth } from './changelog';

export interface BuildOptions {
  repoRoot: string;
  outDir: string;
  siteUrl: string;
  repo: string;
  token?: string;
  offline?: boolean;
}

const APP_URL = 'https://acordesai.bthings.com.ar';
const SERVER_APK = `${APP_URL}/downloads/acordesai.apk`;

export const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NOTE_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';

interface PageMeta {
  title: string;
  description: string;
  /** Ruta de salida relativa a outDir, p. ej. "acordes/am.html". */
  path: string;
  nav?: string;
}

interface Ctx extends BuildOptions {
  apkUrl: string;
  apkVersion: string | null;
  pages: string[];
}

function rootPrefix(path: string): string {
  return '../'.repeat(path.split('/').length - 1);
}

function canonical(ctx: Ctx, path: string): string {
  return ctx.siteUrl + path.replace(/(^|\/)index\.html$/, '$1');
}

function layout(ctx: Ctx, meta: PageMeta, body: string): string {
  const r = rootPrefix(meta.path);
  const url = canonical(ctx, meta.path);
  const link = (key: string, href: string, label: string, cls = '') =>
    `<a${cls ? ` class="${cls}"` : ''} href="${href}"${meta.nav === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(meta.title)}</title>
  <meta name="description" content="${esc(meta.description)}">
  <meta name="theme-color" content="#121212">${
    // GitHub Pages sirve 404.html en cualquier ruta: sin <base> los enlaces relativos se rompen.
    meta.path === '404.html' ? `\n  <base href="${ctx.siteUrl}">\n  <meta name="robots" content="noindex">` : ''
  }
  <link rel="canonical" href="${url}">
  <link rel="icon" href="${r}assets/pwa-192x192.png">
  <link rel="apple-touch-icon" href="${r}assets/apple-touch-icon.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="AcordesAI">
  <meta property="og:title" content="${esc(meta.title)}">
  <meta property="og:description" content="${esc(meta.description)}">
  <meta property="og:image" content="${ctx.siteUrl}assets/01-home.png">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${r}site.css">
</head>
<body>
  <header>
    <div class="wrap nav">
      <a class="logo" href="${r || './'}"><span class="logo-mark" aria-hidden="true">${NOTE_SVG}</span><span>Acordes<span style="color:var(--brand)">AI</span></span></a>
      <nav class="nav-links" aria-label="Secciones">
        ${link('home', `${r}#funciones`, 'Funciones', 'hide-sm')}
        ${link('acordes', `${r}acordes/`, 'Acordes')}
        ${link('ayuda', `${r}ayuda.html`, 'Ayuda', 'hide-sm')}
        ${link('novedades', `${r}novedades.html`, 'Novedades', 'hide-sm')}
        <a class="btn btn-primary btn-sm" href="${APP_URL}">Abrir app</a>
      </nav>
    </div>
  </header>

  <main>
${body}
  </main>

  <footer>
    <div class="wrap row">
      <span>© AcordesAI · <a href="https://github.com/${ctx.repo}/blob/main/LICENSE">Licencia MIT</a></span>
      <nav class="foot-links" aria-label="Pie de página">
        <a href="${APP_URL}">App</a>
        <a href="${r}acordes/">Acordes</a>
        <a href="${r}ayuda.html">Ayuda</a>
        <a href="${r}novedades.html">Novedades</a>
        <a href="${r}estado.html">Estado</a>
        <a href="${r}privacidad.html">Privacidad</a>
        <a href="${r}terminos.html">Términos</a>
        <a href="https://github.com/${ctx.repo}">GitHub</a>
      </nav>
    </div>
  </footer>
</body>
</html>
`;
}

function emit(ctx: Ctx, meta: PageMeta, body: string): void {
  const file = join(ctx.outDir, meta.path);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, layout(ctx, meta, body));
  ctx.pages.push(meta.path);
}

/** Lee el comentario inicial de una página: `<!-- title: … \n description: … -->`. */
export function parseFragment(source: string): { meta: Record<string, string>; body: string } {
  const match = source.match(/^<!--([\s\S]*?)-->\s*/);
  const meta: Record<string, string> = {};
  if (match) {
    for (const line of match[1].split('\n')) {
      const kv = line.match(/^\s*(\w+):\s*(.+?)\s*$/);
      if (kv) meta[kv[1]] = kv[2];
    }
  }
  return { meta, body: match ? source.slice(match[0].length) : source };
}

// ---------- Acordes ----------

const svg = (el: ReactElement) => renderToStaticMarkup(el);
const chordHref = (e: ChordEntry) => `${e.slug}.html`;

function chordCard(e: ChordEntry): string {
  return `<a class="chord-card" href="${chordHref(e)}">${svg(<ChordDiagram shape={e.guitar} width={120} />)}<span>${esc(e.spanishName)}</span></a>`;
}

function chordTeaser(entries: ChordEntry[]): string {
  const popular = ['C', 'G', 'Am', 'F', 'D', 'Em'];
  const picks = popular.map((n) => entries.find((e) => e.name === n)).filter((e): e is ChordEntry => !!e);
  return picks
    .map((e) => `<a class="chord-card" href="acordes/${chordHref(e)}">${svg(<ChordDiagram shape={e.guitar} width={120} />)}<span>${esc(e.spanishName)}</span></a>`)
    .join('\n');
}

function chordPage(ctx: Ctx, e: ChordEntry, all: ChordEntry[]): void {
  const sameRoot = all.filter((o) => o.root === e.root && o.name !== e.name);
  const sameQuality = all.filter((o) => o.quality.suffix === e.quality.suffix && o.name !== e.name);
  const chips = (list: ChordEntry[]) =>
    list.map((o) => `<a class="chip" href="${chordHref(o)}">${esc(o.name)}</a>`).join('');
  const notes = e.notes.map(noteToSpanish).join(' – ');
  const list = (lines: string[]) => `<ul class="howto">${lines.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;

  const body = `    <section class="page">
      <div class="wrap">
        <nav class="crumbs" aria-label="Ruta"><a href="../">Inicio</a> / <a href="./">Acordes</a> / <span>${esc(e.name)}</span></nav>
        <h1 class="page-title">Acorde ${esc(e.name)} <span class="muted">· ${esc(e.spanishName)}</span></h1>
        <p class="page-lead">Notas: <strong>${esc(notes)}</strong> (${esc(e.notes.join(' – '))}). Fórmula: ${esc(e.quality.formula)}.${
          e.altName ? ` También se escribe <strong>${esc(e.altName)}</strong>.` : ''
        }</p>

        <div class="diagrams">
          <figure class="diagram">${svg(<ChordDiagram shape={e.guitar} width={170} />)}<figcaption>Guitarra</figcaption></figure>
          ${e.ukulele ? `<figure class="diagram">${svg(<UkuleleChordDiagram shape={e.ukulele} width={130} />)}<figcaption>Ukelele</figcaption></figure>` : ''}
          <figure class="diagram">${svg(<PianoChordDiagram chordName={e.name} width={260} />)}<figcaption>Piano</figcaption></figure>
        </div>

        <div class="cols">
          <div class="card"><h2 class="h3">Cómo se toca en guitarra</h2>${list(describeShape(e.guitar, GUITAR_STRINGS))}</div>
          ${e.ukulele ? `<div class="card"><h2 class="h3">Cómo se toca en ukelele</h2>${list(describeShape(e.ukulele, UKULELE_STRINGS))}</div>` : ''}
        </div>

        <div class="band band-sm">
          <h2 class="h3">Tocalo en una canción</h2>
          <p>Buscá cualquier canción en AcordesAI: debajo del cifrado aparecen los diagramas de todos sus acordes, para el instrumento que elijas y en el tono que pongas.</p>
          <a class="btn btn-primary" href="${APP_URL}">Abrir AcordesAI</a>
        </div>

        ${sameRoot.length ? `<h2 class="h3">Otros acordes de ${esc(noteToSpanish(e.root))}</h2><div class="chips">${chips(sameRoot)}</div>` : ''}
        <h2 class="h3">Otros acordes ${esc(e.quality.name === 'mayor' ? 'mayores' : `de ${e.quality.name}`)}</h2>
        <div class="chips">${chips(sameQuality)}</div>
      </div>
    </section>`;

  emit(ctx, {
    path: `acordes/${chordHref(e)}`,
    nav: 'acordes',
    title: `Acorde ${e.name} (${e.spanishName}) en guitarra, ukelele y piano · AcordesAI`,
    description: `Cómo tocar ${e.name} (${e.spanishName}): diagrama para guitarra${e.ukulele ? ', ukelele' : ''} y piano, notas ${notes} y posición de cada dedo.`,
  }, body);
}

function chordIndex(ctx: Ctx, entries: ChordEntry[]): void {
  const groups = QUALITIES.map((q) => ({ q, items: entries.filter((e) => e.quality.suffix === q.suffix) })).filter((g) => g.items.length);
  const body = `    <section class="page">
      <div class="wrap">
        <nav class="crumbs" aria-label="Ruta"><a href="../">Inicio</a> / <span>Acordes</span></nav>
        <h1 class="page-title">Diccionario de acordes</h1>
        <p class="page-lead">Los ${entries.length} acordes más usados con su diagrama para guitarra, ukelele y piano. Tocá uno para ver las notas y dónde va cada dedo.</p>
        ${groups.map((g) => `<h2 class="h3">${esc(g.q.group)}</h2>\n        <div class="chord-grid">${g.items.map(chordCard).join('')}</div>`).join('\n        ')}
      </div>
    </section>`;
  emit(ctx, {
    path: 'acordes/index.html',
    nav: 'acordes',
    title: 'Diccionario de acordes para guitarra, ukelele y piano · AcordesAI',
    description: `Diagramas de ${entries.length} acordes (mayores, menores, séptimas, sus4) para guitarra, ukelele y piano, con notas y posición de los dedos.`,
  }, body);
}

// ---------- Novedades ----------

function changelogPage(ctx: Ctx, months: ChangelogMonth[] | null): void {
  const prsUrl = `https://github.com/${ctx.repo}/pulls?q=is%3Apr+is%3Amerged`;
  const content = months?.length
    ? months.map((m) => `<h2 class="h3">${esc(m.label)}</h2>
        <ul class="changes">${m.items.map((i) => `<li><span class="kind kind-${i.kind.toLowerCase()}">${i.kind}</span><span>${esc(i.text)} <a class="muted" href="${i.url}">#${i.number}</a></span></li>`).join('')}${
          m.dependencyUpdates ? `<li><span class="kind kind-interno">Interno</span><span>${m.dependencyUpdates} ${m.dependencyUpdates === 1 ? 'actualización' : 'actualizaciones'} de dependencias</span></li>` : ''
        }</ul>`).join('\n        ')
    : `<p>Ahora no se pudo armar la lista. Los cambios están en <a href="${prsUrl}">GitHub</a>.</p>`;
  const body = `    <section class="page">
      <div class="wrap narrow">
        <h1 class="page-title">Novedades</h1>
        <p class="page-lead">Cada cambio que llega a la app, en orden. Sale solo de los cambios aprobados en <a href="${prsUrl}">GitHub</a>${ctx.apkVersion ? `. Última versión de Android: <strong>${esc(ctx.apkVersion)}</strong>` : ''}.</p>
        ${content}
      </div>
    </section>`;
  emit(ctx, {
    path: 'novedades.html',
    nav: 'novedades',
    title: 'Novedades · AcordesAI',
    description: 'Qué cambió en AcordesAI: funciones nuevas, arreglos y mejoras, mes a mes.',
  }, body);
}

// ---------- Sitio ----------

function sitemap(ctx: Ctx): string {
  const today = new Date().toISOString().slice(0, 10);
  const urls = ctx.pages
    .filter((p) => p !== '404.html')
    .map((p) => `  <url><loc>${canonical(ctx, p)}</loc><lastmod>${today}</lastmod></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export async function buildSite(opts: BuildOptions): Promise<{ pages: string[] }> {
  const landing = join(opts.repoRoot, 'landing');
  const [prs, apk] = opts.offline
    ? [null, null]
    : await Promise.all([fetchMergedPrs(opts.repo, opts.token), fetchLatestApk(opts.repo, opts.token)]);
  const ctx: Ctx = { ...opts, apkUrl: apk?.url ?? SERVER_APK, apkVersion: apk?.version ?? null, pages: [] };

  mkdirSync(join(opts.outDir, 'assets'), { recursive: true });
  cpSync(join(landing, 'site.css'), join(opts.outDir, 'site.css'));
  // Capturas e íconos se copian desde donde ya viven para no duplicarlos en el repo.
  for (const f of readdirSync(join(opts.repoRoot, 'docs/screenshots')).filter((f) => f.endsWith('.png'))) {
    cpSync(join(opts.repoRoot, 'docs/screenshots', f), join(opts.outDir, 'assets', f));
  }
  for (const f of ['pwa-192x192.png', 'apple-touch-icon.png']) {
    cpSync(join(opts.repoRoot, 'public', f), join(opts.outDir, 'assets', f));
  }

  const entries = buildChordEntries();
  const vars: Record<string, string> = {
    APP_URL,
    APK_URL: ctx.apkUrl,
    REPO_URL: `https://github.com/${opts.repo}`,
    STATUS_URL: `https://raw.githubusercontent.com/${opts.repo}/status-data/history.json`,
    CHORD_TEASER: chordTeaser(entries),
  };

  for (const file of readdirSync(join(landing, 'pages')).filter((f) => f.endsWith('.html')).sort()) {
    const { meta, body } = parseFragment(readFileSync(join(landing, 'pages', file), 'utf8'));
    const html = body.replace(/\{\{(\w+)\}\}/g, (all, key: string) => {
      if (!(key in vars)) throw new Error(`landing/pages/${file}: variable desconocida ${all}`);
      return vars[key];
    });
    if (!meta.title || !meta.description) throw new Error(`landing/pages/${file}: falta title o description`);
    emit(ctx, { path: file, title: meta.title, description: meta.description, nav: meta.nav }, html);
  }

  chordIndex(ctx, entries);
  for (const e of entries) chordPage(ctx, e, entries);
  changelogPage(ctx, prs ? groupByMonth(prs) : null);

  writeFileSync(join(opts.outDir, 'sitemap.xml'), sitemap(ctx));
  writeFileSync(join(opts.outDir, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${opts.siteUrl}sitemap.xml\n`);
  return { pages: ctx.pages };
}
