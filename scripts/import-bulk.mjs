#!/usr/bin/env node
// Bulk import de canciones desde CifraClub.
// Uso: node scripts/import-bulk.mjs [--dry-run]
//
// Estrategia: construir URL directa a partir de slug. Fallback a Bing search
// si la URL directa no existe. Extrae el <pre> más largo y lo inserta en la DB.

import { execFileSync } from 'node:child_process';

const USER_ID = 3; // agustinbouzon9@gmail.com
const DB_CONTAINER = 'open-acordesai-postgres-1';
const DRY_RUN = process.argv.includes('--dry-run');

const SONGS = [
  { title: 'Escucho tu voz', artist: 'Los Charros' },
  { title: 'Y me resulta imposible', artist: 'Las Pastillas del Abuelo' },
  { title: 'Perdido', artist: 'Las Pastillas del Abuelo' },
  { title: 'Sabina y Piazzolla', artist: 'Las Pastillas del Abuelo', artistSlug: 'las-pastillas-del-abuelo', titleSlugs: ['sabina-y-piazzolla', 'sabina-y-piazolla'] },
  { title: 'Leer y escribir', artist: 'Las Pastillas del Abuelo' },
  { title: 'Calipso', artist: 'Las Pastillas del Abuelo' },
  { title: 'Barro Tal Vez', artist: 'Luis Alberto Spinetta' },
  { title: 'Pensamientos', artist: 'Airbag' },
  { title: 'Allá en Tilcara', artist: 'Almafuerte' },
  { title: 'La doctora II', artist: 'Piti Fernandez', titleSlugs: ['la-doctora-ii', 'la-doctora-2'] },
  { title: 'En El Limbo', artist: 'La Vela Puerca' },
  { title: "Can't Stop", artist: 'Red Hot Chili Peppers' },
  { title: 'Californication', artist: 'Red Hot Chili Peppers' },
  { title: 'Mezcla Rara', artist: 'Los Gardelitos' },
  { title: 'Dark Necessities', artist: 'Red Hot Chili Peppers' },
  { title: 'Under The Bridge', artist: 'Red Hot Chili Peppers' },
  { title: 'Diosa de la transformación', artist: 'Las Pastillas del Abuelo' },
  { title: '19 Dias Y 500 Noches', artist: 'Joaquín Sabina' },
  { title: 'La Creatividad', artist: 'Las Pastillas del Abuelo' },
  { title: 'Blackbird', artist: 'The Beatles' },
  { title: 'La Mona Y El Mono', artist: 'Piti Fernandez' },
  { title: 'Esperándome', artist: 'Piti Fernandez' },
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['´`]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function titleSimilarity(a, b) {
  const sa = new Set(a.split('-').filter((x) => x.length > 1));
  const sb = new Set(b.split('-').filter((x) => x.length > 1));
  if (sa.size === 0 || sb.size === 0) return 0;
  let hits = 0;
  for (const t of sa) if (sb.has(t)) hits++;
  return hits / Math.max(sa.size, sb.size);
}

async function fetchHead(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 10000);
  try {
    const r = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': UA }, signal: ctrl.signal, redirect: 'manual' });
    return r.status;
  } catch { return 0; }
  finally { clearTimeout(t); }
}

async function fetchText(url, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      signal: ctrl.signal, redirect: 'follow',
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally { clearTimeout(t); }
}

function buildCandidates(song) {
  const artistSlug = song.artistSlug || slugify(song.artist);
  const titleSlugs = song.titleSlugs || [slugify(song.title)];
  const urls = [];
  for (const ts of titleSlugs) {
    urls.push(`https://www.cifraclub.com/${artistSlug}/${ts}/`);
  }
  return urls;
}

async function bingSearch(title, artist) {
  const q = `${title} ${artist} site:cifraclub.com`;
  const url = `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
  const html = await fetchText(url);
  const found = [...html.matchAll(/https:\/\/www\.cifraclub\.com(?:\.br)?\/[a-z0-9\-]+\/[a-z0-9\-]+\/?/gi)]
    .map((m) => m[0].replace(/\/$/, '') + '/');
  // Dedup, prefer .com over .com.br
  const uniq = [...new Set(found)].sort((a, b) => (a.includes('.com.br') ? 1 : 0) - (b.includes('.com.br') ? 1 : 0));
  return uniq[0] || null;
}

async function resolveUrl(song) {
  const artistSlug = song.artistSlug || slugify(song.artist);
  const desiredTitleSlug = slugify(song.title);

  for (const candidate of buildCandidates(song)) {
    const status = await fetchHead(candidate);
    if (status >= 200 && status < 400) {
      // CifraClub devuelve 200 con una página "not found" cuando la URL es inválida.
      // Verificar que tenga <pre>; si no, buscar sugerencias en la misma página.
      try {
        const html = await fetchText(candidate);
        if (/<pre[^>]*>/i.test(html)) return candidate;

        const links = [...html.matchAll(new RegExp(`href="/${artistSlug}/([a-z0-9\\-]+)/"`, 'gi'))]
          .map((m) => m[1])
          .filter((s) => s && !['discografia', 'letras', 'fotos', 'videos'].includes(s));
        const uniq = [...new Set(links)];
        const scored = uniq
          .map((slug) => ({ slug, score: titleSimilarity(desiredTitleSlug, slug) }))
          .sort((a, b) => b.score - a.score);
        if (scored.length && scored[0].score >= 0.5) {
          const guess = `https://www.cifraclub.com/${artistSlug}/${scored[0].slug}/`;
          return guess;
        }
      } catch {}
    }
  }
  try { return await bingSearch(song.title, song.artist); } catch { return null; }
}

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function scrape(url) {
  const html = await fetchText(url);
  const pres = [...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)].map((m) => stripTags(m[1]).trim());
  if (pres.length === 0) return null;
  pres.sort((a, b) => b.length - a.length);
  const content = pres[0];
  if (content.length < 100) return null;
  return { content };
}

function psql(sql, params = []) {
  const escaped = params.map((p) => {
    if (p === null || p === undefined) return 'NULL';
    if (typeof p === 'number') return String(p);
    return "'" + String(p).replace(/'/g, "''") + "'";
  });
  const filled = sql.replace(/\$(\d+)/g, (_, n) => escaped[Number(n) - 1]);
  const out = execFileSync(
    'docker',
    ['exec', '-i', DB_CONTAINER, 'psql', '-U', 'acordesai', '-d', 'acordesai', '-t', '-A', '-c', filled],
    { encoding: 'utf8' }
  );
  return out.trim();
}

function existsBySourceUrl(sourceUrl) {
  const out = psql('SELECT id FROM songs WHERE source_url = $1 LIMIT 1', [sourceUrl]);
  return out.length > 0 ? Number(out) : null;
}

function insertSong({ title, artist, lyrics, source, sourceUrl }) {
  const out = psql(
    'INSERT INTO songs (title, artist, lyrics, source, source_url, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [title, artist, lyrics, source, sourceUrl, USER_ID]
  );
  const id = Number(out);
  // Replicar el contenido a chord_cache (guitar) para que el frontend lo muestre.
  psql(
    `INSERT INTO chord_cache (song_id, instrument, title, artist, content)
     VALUES ($1, 'guitar', $2, $3, $4)
     ON CONFLICT (song_id, instrument) DO UPDATE SET content = EXCLUDED.content`,
    [id, title, artist, lyrics]
  );
  return id;
}

async function main() {
  let imported = 0, skipped = 0, failed = 0;
  const results = [];

  for (let i = 0; i < SONGS.length; i++) {
    const song = SONGS[i];
    console.log(`\n[${i + 1}/${SONGS.length}] ${song.title} — ${song.artist}`);

    try {
      const url = await resolveUrl(song);
      if (!url) {
        console.log('  ✗ URL no encontrada');
        failed++;
        results.push({ ...song, status: 'no-url' });
        continue;
      }
      console.log(`  → ${url}`);

      if (!DRY_RUN) {
        const existingId = existsBySourceUrl(url);
        if (existingId) {
          console.log(`  ⏭ ya existe (id=${existingId})`);
          skipped++;
          results.push({ ...song, status: 'exists', id: existingId, url });
          continue;
        }
      }

      const data = await scrape(url);
      if (!data) {
        console.log('  ✗ sin <pre> útil');
        failed++;
        results.push({ ...song, status: 'no-content', url });
        continue;
      }

      console.log(`  ✓ ${data.content.length} chars`);

      if (DRY_RUN) {
        imported++;
        results.push({ ...song, status: 'dry-ok', url, size: data.content.length });
      } else {
        const id = insertSong({
          title: song.title,
          artist: song.artist,
          lyrics: data.content,
          source: 'cifraclub',
          sourceUrl: url,
        });
        console.log(`  ✓ insertado id=${id}`);
        imported++;
        results.push({ ...song, status: 'imported', id, url, size: data.content.length });
      }
    } catch (e) {
      console.log(`  ✗ error: ${e.message}`);
      failed++;
      results.push({ ...song, status: 'error', error: e.message });
    }

    await sleep(1500);
  }

  console.log(`\n── Resumen ──`);
  console.log(`  importadas: ${imported}`);
  console.log(`  saltadas:   ${skipped}`);
  console.log(`  fallidas:   ${failed}`);
  console.log(`  total:      ${SONGS.length}`);
  if (DRY_RUN) console.log(`  (dry-run: no se escribió en DB)`);

  const failedList = results.filter((r) => ['no-url', 'no-content', 'error'].includes(r.status));
  if (failedList.length) {
    console.log(`\nFallidas:`);
    for (const r of failedList) {
      console.log(`  - ${r.title} — ${r.artist}: ${r.status}${r.error ? ' (' + r.error + ')' : ''}`);
    }
  }
}

main().catch((e) => { console.error('fatal:', e); process.exit(1); });
