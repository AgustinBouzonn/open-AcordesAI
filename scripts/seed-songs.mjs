#!/usr/bin/env node
// Carga masiva de cifrados desde Ultimate Guitar a la base (songs + chord_cache), igual que el
// import por URL. Cifra Club bloquea IPs de datacenter (Akamai 403), UG no.
//
//   DATABASE_URL=... node scripts/seed-songs.mjs [--dry-run] [--per-artist 15] [--top-pages 4] [--artists "Soda Stereo,Divididos"]
//
// - Por artista: busca en UG, se queda con la versión "Chords" mejor votada de cada canción.
// - --top-pages N: además, las N páginas (50 c/u) de los cifrados más vistos de UG.
// - Deduplica por source_url y por título+artista: se puede correr de nuevo sin duplicar.
// - Con un host de Neon usa su driver HTTP (@neondatabase/serverless, puerto 443); si no, pg.
// - Las páginas se bajan con curl: a fetch de Node, Cloudflare le responde un challenge (429).
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';
import { promisify } from 'node:util';

const require = createRequire(new URL('../backend/package.json', import.meta.url));

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const DRY_RUN = flag('dry-run');
const PER_ARTIST = Number(opt('per-artist', 15));
const TOP_PAGES = Number(opt('top-pages', 0));
const DELAY_MS = Number(opt('delay', 800));

// Rock y pop argentino/latino primero: es el público de la app. Después clásicos globales.
const DEFAULT_ARTISTS = [
  'Soda Stereo', 'Gustavo Cerati', 'Charly García', 'Luis Alberto Spinetta', 'Fito Páez', 'Andrés Calamaro',
  'Indio Solari', 'Divididos', 'Sumo', 'Los Fabulosos Cadillacs', 'Vicentico', 'Babasónicos',
  'La Renga', 'Los Piojos', 'Ciro y los Persas', 'Las Pastillas del Abuelo', 'No Te Va Gustar', 'La Vela Puerca',
  'Los Enanitos Verdes', 'Los Abuelos de la Nada', 'Serú Girán', 'Sui Generis', 'León Gieco', 'Mercedes Sosa',
  'Atahualpa Yupanqui', 'Bersuit Vergarabat', 'Callejeros', 'Los Auténticos Decadentes', 'Airbag', 'Los Pericos',
  'Attaque 77', 'El Cuarteto de Nos', 'Jorge Drexler', 'Abel Pintos', 'Diego Torres', 'Los Tipitos', 'Rata Blanca',
  'Almafuerte', 'Patricio Rey y sus Redonditos de Ricota', 'Intoxicados', 'Guasones', 'Manu Chao', 'Maná', 'Juanes',
  'Shakira', 'Joaquín Sabina', 'Silvio Rodríguez', 'Café Tacvba', 'Héroes del Silencio', 'Enrique Bunbury',
  'Ricardo Arjona', 'Jesse & Joy', 'Reik', 'Carlos Vives', 'Natalia Lafourcade', 'Mon Laferte', 'Caifanes',
  'Zoé', 'Hombres G', 'Duncan Dhu', 'La Oreja de Van Gogh', 'Estopa', 'Fito y Fitipaldis', 'Extremoduro',
  'The Beatles', 'Oasis', 'Coldplay', 'Red Hot Chili Peppers', 'Nirvana', 'Queen', 'Pink Floyd', 'Radiohead',
  'Bob Dylan', 'Ed Sheeran', 'Green Day', 'Guns N Roses', 'Eagles', 'Bob Marley', 'Elvis Presley',
];
const ARTISTS = opt('artists', '') ? opt('artists', '').split(',').map((s) => s.trim()).filter(Boolean) : DEFAULT_ARTISTS;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const run = promisify(execFile);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => entities(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const decode = (s) => s
  .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#39;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

// UG guarda algunos nombres con entidades HTML ("De M&uacute;sica Ligera").
const ACCENTS = { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú' };
const NAMED = { ntilde: 'ñ', Ntilde: 'Ñ', uuml: 'ü', Uuml: 'Ü', ccedil: 'ç', Ccedil: 'Ç', atilde: 'ã', otilde: 'õ', iexcl: '¡', iquest: '¿', amp: '&', quot: '"', apos: "'", nbsp: ' ' };
const entities = (s) => String(s ?? '')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&([a-zA-Z]+);/g, (m, name) => {
    const acute = name.match(/^([aeiouAEIOU])acute$/);
    if (acute) return ACCENTS[acute[1]];
    return NAMED[name] ?? m;
  });

async function ugStore(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await sleep(DELAY_MS);
    try {
      // Sin Accept-Language: con "es" UG redirige a es.ultimate-guitar.com.
      const { stdout } = await run('curl', ['-s', '-m', '20', '-A', UA, '-w', '\n%{http_code}', url], { maxBuffer: 20 * 1024 * 1024 });
      const cut = stdout.lastIndexOf('\n');
      const status = Number(stdout.slice(cut + 1));
      if (status === 404) return null;
      if (status !== 200) throw new Error(`HTTP ${status}`);
      const html = stdout.slice(0, cut);
      const m = html.match(/class="js-store"[^>]*data-content="([^"]*)"/);
      if (!m) throw new Error('sin js-store');
      return JSON.parse(decode(m[1])).store?.page?.data ?? null;
    } catch (e) {
      if (attempt === 2) { console.warn(`  ! ${url}: ${e.message}`); return null; }
      await sleep(10000 * (attempt + 1));
    }
  }
  return null;
}

const score = (r) => (Number(r.votes) || 0) * (Number(r.rating) || 0);

/** De una lista de resultados de UG: la mejor versión "Chords" de cada canción. */
function bestPerSong(results, artistFilter) {
  const bySong = new Map();
  for (const r of results) {
    if (r.type !== 'Chords' || r.tab_access_type === 'private' || !r.tab_url?.includes('/tab/')) continue;
    if (artistFilter && norm(r.artist_name) !== norm(artistFilter)) continue;
    const key = `${norm(r.artist_name)}|${norm(r.song_name)}`;
    const prev = bySong.get(key);
    if (!prev || score(r) > score(prev)) bySong.set(key, r);
  }
  return [...bySong.values()].toSorted((a, b) => score(b) - score(a));
}

async function searchArtist(artist) {
  const all = [];
  for (let page = 1; page <= 3; page++) {
    const data = await ugStore(`https://www.ultimate-guitar.com/search.php?search_type=title&value=${encodeURIComponent(artist)}&page=${page}`);
    if (!data?.results?.length) break;
    all.push(...data.results);
    if (page >= (data.pagination?.total ?? 1)) break;
  }
  // UG puede escribir el nombre distinto ("Charly García"): si el filtro exacto no da nada,
  // se toma el artista más frecuente entre los resultados que lo contienen.
  let best = bestPerSong(all, artist);
  if (!best.length) {
    const counts = new Map();
    const word = new RegExp(`(^| )${norm(artist)}( |$)`);
    for (const r of all) if (word.test(norm(r.artist_name))) counts.set(r.artist_name, (counts.get(r.artist_name) ?? 0) + 1);
    const top = [...counts.entries()].toSorted((a, b) => b[1] - a[1])[0]?.[0];
    if (top) best = bestPerSong(all, top);
  }
  return best.slice(0, PER_ARTIST);
}

async function topCharts(pages) {
  const all = [];
  for (let page = 1; page <= pages; page++) {
    const data = await ugStore(`https://www.ultimate-guitar.com/explore?type[]=Chords&order=hitstotal_desc&page=${page}`);
    if (!data?.data?.tabs?.length) break;
    all.push(...data.data.tabs);
  }
  return bestPerSong(all);
}

async function fetchTab(result) {
  const data = await ugStore(result.tab_url);
  const raw = data?.tab_view?.wiki_tab?.content;
  if (typeof raw !== 'string') return null;
  const content = entities(raw).replace(/\[\/?(?:ch|tab)\]/g, '').replace(/\r\n/g, '\n').trim();
  if (content.length < 100) return null;
  return {
    title: entities(data.tab?.song_name || result.song_name).trim(),
    artist: entities(data.tab?.artist_name || result.artist_name).trim(),
    key: data.tab_view?.meta?.tonality || data.tab?.tonality_name || result.tonality_name || null,
    artwork: result.album_cover?.web_album_cover?.small || null,
    sourceUrl: result.tab_url,
    content: content.slice(0, 60000),
  };
}

async function connect() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    if (DRY_RUN) return null;
    throw new Error('DATABASE_URL must be configured');
  }
  if (/\.neon\.tech/.test(url)) {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(url);
    return { query: (text, params) => sql.query(text, params), end: async () => {} };
  }
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: url, max: 1 });
  return { query: async (text, params) => (await pool.query(text, params)).rows, end: () => pool.end() };
}

async function main() {
  const db = await connect();
  const queue = [];
  if (TOP_PAGES > 0) {
    console.log(`Top de UG (${TOP_PAGES} páginas)…`);
    queue.push(...await topCharts(TOP_PAGES));
  }
  for (const artist of ARTISTS) {
    const songs = await searchArtist(artist);
    console.log(`${artist}: ${songs.length} canciones`);
    queue.push(...songs);
  }

  let inserted = 0, skipped = 0, failed = 0;
  for (const r of queue) {
    if (db) {
      const existing = await db.query(
        'SELECT 1 FROM songs WHERE source_url = $1 OR (lower(title) = lower($2) AND lower(artist) = lower($3)) LIMIT 1',
        [r.tab_url, r.song_name, r.artist_name],
      );
      if (existing.length) { skipped++; continue; }
    }
    const tab = await fetchTab(r);
    if (!tab) { failed++; continue; }
    if (DRY_RUN || !db) {
      console.log(`  [dry] ${tab.artist} - ${tab.title} (${tab.content.length} chars, key ${tab.key ?? '?'})`);
      inserted++;
      continue;
    }
    // Una sola sentencia: la canción y su cifrado entran juntos o no entra ninguno.
    await db.query(
      `WITH s AS (
         INSERT INTO songs (title, artist, lyrics, source, source_url, user_id)
         VALUES ($1, $2, $3, 'ultimateguitar', $4, NULL)
         RETURNING id
       )
       INSERT INTO chord_cache (song_id, instrument, title, artist, artwork_url, key, content, origin)
       SELECT id, 'guitar', $1, $2, $5, $6, $3, 'import' FROM s`,
      [tab.title, tab.artist, tab.content, tab.sourceUrl, tab.artwork, tab.key],
    );
    inserted++;
    if (inserted % 25 === 0) console.log(`  … ${inserted} insertadas`);
  }

  console.log(`Listo: ${inserted} insertadas, ${skipped} ya estaban, ${failed} sin cifrado.`);
  await db?.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
