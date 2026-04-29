import { Router, Request, Response } from 'express';
import { importLimiter } from '../middleware/rateLimit';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { serializeSong } from '../serializers/song';

const router = Router();

const ALLOWED_HOST_PATTERNS: RegExp[] = [
  /^www\.ultimateguitar\.com$/i,
  /^www\.cifraclub\.com$/i,
  /^www\.cifraclub\.com\.br$/i,
  /^www\.cifraclub\.com\.ar$/i,
  /^cifraclub\.com$/i,
  /^cifraclub\.com\.br$/i,
  /^cifraspot\.com$/i,
];

const TRACKING_PARAMS = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid', '_ga', 'ref', 'src',
  'igshid', 'si', 'feature', 'spm',
];

interface NormalizedUrl {
  fetchUrl: string;
  canonicalUrl: string;
  host: string;
}

function normalizeImportUrl(rawUrl: string): NormalizedUrl | null {
  let trimmed = rawUrl.trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//i.test(trimmed)) trimmed = `https://${trimmed}`;

  let u: URL;
  try {
    u = new URL(trimmed);
  } catch {
    return null;
  }

  if (u.username || u.password) return null;
  u.protocol = 'https:';

  let host = u.hostname.toLowerCase();
  if (/^m\.cifraclub\.com(\.br|\.ar)?$/.test(host)) {
    host = host.replace(/^m\./, 'www.');
  }
  if (host === 'cifraclub.com' || host === 'cifraclub.com.br' || host === 'cifraclub.com.ar') {
    host = `www.${host}`;
  }
  u.hostname = host;

  for (const p of TRACKING_PARAMS) u.searchParams.delete(p);
  u.hash = '';

  let pathname = u.pathname.replace(/\/+$/, '');
  if (!pathname) pathname = '/';
  u.pathname = pathname;

  const search = u.searchParams.toString();
  const fetchUrl = `${u.protocol}//${u.hostname}${u.pathname}${search ? `?${search}` : ''}`;
  const canonicalUrl = `${u.protocol}//${u.hostname}${u.pathname}`;

  if (!ALLOWED_HOST_PATTERNS.some((re) => re.test(host))) return null;

  return { fetchUrl, canonicalUrl, host };
}

const SOURCES = [
  { id: 'ultimateguitar', name: 'Ultimate Guitar', baseUrl: 'https://www.ultimateguitar.com', searchUrl: 'https://www.ultimateguitar.com/search.php?search_type=title&value=' },
  { id: 'cifraclub', name: 'Cifra Club', baseUrl: 'https://www.cifraclub.com', searchUrl: 'https://www.cifraclub.com/?q=' },
  { id: 'cifraspot', name: 'CifraSpot', baseUrl: 'https://cifraspot.com', searchUrl: 'https://cifraspot.com/search?q=' },
];

router.get('/sources', (_, res) => {
  res.json(SOURCES.map((s) => ({ id: s.id, name: s.name, baseUrl: s.baseUrl })));
});

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchHtml(url: string, attempts = 2): Promise<string> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    try {
      // @ts-ignore
      const res = await fetch(url, {
        signal: ctrl.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-ES,es;q=0.9,pt-BR;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Upgrade-Insecure-Requests': '1',
        },
      });
      if (res && res.ok) return await res.text();
      if (res.status >= 500 && res.status < 600 && i < attempts - 1) {
        lastErr = new Error(`HTTP ${res.status}`);
        await sleep(500 * Math.pow(2, i));
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
      if (i < attempts - 1) await sleep(500 * Math.pow(2, i));
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastErr ?? new Error('fetch failed');
}

const stripTags = (s: string) =>
  s
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'");

const cleanTitlePart = (s: string) =>
  s
    .replace(/\s*\((?:acordes|cifra|tab|tabs|letra|chords|cifrado|partitura|guitarra|ukulele|piano|teclado)[^)]*\)\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

function parseTitleString(raw: string): { title: string; artist: string } {
  const cleaned = raw
    .replace(/\s*[-|·:]\s*Cifra Club.*$/i, '')
    .replace(/\s*[-|·:]\s*Ultimate Guitar.*$/i, '')
    .replace(/\s*[-|·:]\s*CifraSpot.*$/i, '')
    .trim();
  const parts = cleaned.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    return { title: cleanTitlePart(parts[0]), artist: cleanTitlePart(parts.slice(1).join(' - ')) };
  }
  return { title: cleanTitlePart(cleaned), artist: '' };
}

function findInObject(obj: unknown, keys: string[], depth = 0): string | null {
  if (depth > 6 || obj === null || obj === undefined) return null;
  if (typeof obj === 'string') return obj.length > 100 ? obj : null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findInObject(item, keys, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof obj === 'object') {
    const rec = obj as Record<string, unknown>;
    for (const k of Object.keys(rec)) {
      if (keys.some((target) => k.toLowerCase().includes(target))) {
        const v = rec[k];
        if (typeof v === 'string' && v.length > 100) return v;
      }
    }
    for (const v of Object.values(rec)) {
      const found = findInObject(v, keys, depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function extractContent(html: string): string | null {
  const cifraPre = html.match(/<pre[^>]*class="[^"]*(?:cifra|chord|tab|sheet)[^"]*"[^>]*>([\s\S]*?)<\/pre>/i);
  if (cifraPre) {
    const cleaned = stripTags(cifraPre[1]).trim();
    if (cleaned.length >= 100) return cleaned;
  }

  const cifraDiv = html.match(/<div[^>]*class="[^"]*(?:cifra[_-]?(?:cnt|content|wrapper)|chord-content|sheet-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
  if (cifraDiv) {
    const cleaned = stripTags(cifraDiv[1]).trim();
    if (cleaned.length >= 100) return cleaned;
  }

  const dataSheet = html.match(/<[a-z]+[^>]+data-(?:sheet|cifra|chords)[^>]*>([\s\S]*?)<\/[a-z]+>/i);
  if (dataSheet) {
    const cleaned = stripTags(dataSheet[1]).trim();
    if (cleaned.length >= 100) return cleaned;
  }

  const nextData = html.match(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/);
  if (nextData) {
    try {
      const data = JSON.parse(nextData[1]);
      const found = findInObject(data, ['cifra', 'chord', 'tab', 'sheet']);
      if (found) {
        const cleaned = stripTags(found).trim();
        if (cleaned.length >= 100) return cleaned;
      }
    } catch { /* noop */ }
  }

  const pres = [...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)]
    .map((m) => stripTags(m[1]).trim())
    .filter((s) => s.length >= 100)
    .sort((a, b) => b.length - a.length);
  if (pres.length) return pres[0];

  return null;
}

function extractMetadata(html: string, fallbackUrl: string): { title: string; artist: string } {
  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (ogTitle) {
    const parsed = parseTitleString(ogTitle[1]);
    if (parsed.title) return parsed;
  }

  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data : [data];
      for (const item of items) {
        const node = item as Record<string, unknown>;
        const type = String(node['@type'] || '');
        if (/Music(Composition|Recording|Album)|Song/i.test(type)) {
          const title = (node.name as string) || (node.headline as string);
          const byArtist = node.byArtist as Record<string, unknown> | undefined;
          const creator = node.creator as Record<string, unknown> | undefined;
          const author = node.author as Record<string, unknown> | undefined;
          const artist = (byArtist?.name as string) || (creator?.name as string) || (author?.name as string);
          if (title) return { title: cleanTitlePart(title), artist: cleanTitlePart(artist || '') };
        }
      }
    } catch { /* noop */ }
  }

  const titleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleTag) {
    const parsed = parseTitleString(stripTags(titleTag[1]));
    if (parsed.title) return parsed;
  }

  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) {
    const parsed = parseTitleString(stripTags(h1[1]));
    if (parsed.title) return parsed;
  }

  try {
    const u = new URL(fallbackUrl);
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return {
        title: cleanTitlePart(parts[parts.length - 1].replace(/-/g, ' ')),
        artist: cleanTitlePart(parts[parts.length - 2].replace(/-/g, ' ')),
      };
    }
  } catch { /* noop */ }

  return { title: 'Sin título', artist: 'Desconocido' };
}

router.post('/fetch', importLimiter, async (req: Request, res: Response) => {
  const { url } = req.body ?? {};
  if (typeof url !== 'string' || !url.trim()) {
    res.status(400).json({ message: 'URL es requerida' });
    return;
  }

  const norm = normalizeImportUrl(url);
  if (!norm) {
    res.status(400).json({ message: 'URL no permitida. Fuentes: Cifra Club, Ultimate Guitar, CifraSpot.' });
    return;
  }

  try {
    const html = await fetchHtml(norm.fetchUrl);
    const content = extractContent(html);
    if (!content) {
      res.status(422).json({ message: 'No se encontró cifrado en la página' });
      return;
    }
    res.json({ chords: content.substring(0, 60000) });
  } catch (e) {
    console.error('[import/fetch]', e);
    const msg = e instanceof Error ? e.message : '';
    if (msg.startsWith('HTTP ')) {
      res.status(502).json({ message: `La fuente respondió ${msg.slice(5)}` });
    } else {
      res.status(502).json({ message: 'No se pudo acceder a la URL' });
    }
  }
});

router.get('/search/:source', importLimiter, async (req: Request, res: Response) => {
  const { source } = req.params;
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  if (!q) { res.status(400).json({ message: 'Query requerida' }); return; }

  const sourceConfig = SOURCES.find((s) => s.id === source);
  if (!sourceConfig) { res.status(400).json({ message: 'Fuente no soportada' }); return; }

  try {
    const searchUrl = sourceConfig.searchUrl + encodeURIComponent(q);
    const html = await fetchHtml(searchUrl);
    const results: Array<{ title: string; artist: string; url: string }> = [];

    if (source === 'ultimateguitar') {
      for (const m of [...html.matchAll(/href="(\/tabs\/[^"]+)"[^>]*>([^<]+)<\/a>/g)].slice(0, 10)) {
        results.push({ title: m[2].trim(), artist: 'Unknown', url: sourceConfig.baseUrl + m[1] });
      }
    } else if (source === 'cifraclub') {
      for (const m of [...html.matchAll(/href="(\/[^"]+)"[^>]*>([^<]+)<\/a>/g)].slice(0, 10)) {
        if (m[1].startsWith('/')) results.push({ title: m[2].trim(), artist: 'Unknown', url: sourceConfig.baseUrl + m[1] });
      }
    }

    res.json({ results: results.slice(0, 10) });
  } catch (e) {
    console.error('[import/search]', e);
    res.status(500).json({ message: 'Error en búsqueda' });
  }
});

router.post('/from-url', requireAuth, importLimiter, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) { res.status(401).json({ message: 'Debes iniciar sesión' }); return; }

  const { url } = req.body ?? {};
  if (typeof url !== 'string' || !url.trim()) {
    res.status(400).json({ message: 'URL es requerida' });
    return;
  }

  const norm = normalizeImportUrl(url);
  if (!norm) {
    res.status(400).json({ message: 'URL no permitida. Fuentes: Cifra Club, Ultimate Guitar, CifraSpot.' });
    return;
  }

  const existing = await query(
    'SELECT * FROM songs WHERE source_url IN ($1, $2, $3) LIMIT 1',
    [norm.fetchUrl, norm.canonicalUrl, url],
  );
  if (existing.rows.length) {
    res.status(200).json({ song: serializeSong(existing.rows[0]), existed: true });
    return;
  }

  let html: string;
  try {
    html = await fetchHtml(norm.fetchUrl);
  } catch (e) {
    console.error('[import/from-url] fetch', e);
    const msg = e instanceof Error ? e.message : '';
    if (msg.startsWith('HTTP ')) {
      res.status(502).json({ message: `La fuente respondió ${msg.slice(5)}` });
    } else {
      res.status(502).json({ message: 'No se pudo acceder a la URL' });
    }
    return;
  }

  const content = extractContent(html);
  if (!content) {
    res.status(422).json({ message: 'No se encontró cifrado en la página' });
    return;
  }

  const meta = extractMetadata(html, norm.fetchUrl);
  const title = meta.title || 'Sin título';
  const artist = meta.artist || 'Desconocido';
  const source = norm.host.includes('ultimateguitar') ? 'ultimateguitar'
    : norm.host.includes('cifraspot') ? 'cifraspot'
    : 'cifraclub';

  try {
    const inserted = await query(
      `INSERT INTO songs (title, artist, lyrics, source, source_url, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, artist, content, source, norm.canonicalUrl, userId],
    );
    const song = inserted.rows[0];

    await query(
      `INSERT INTO chord_cache (song_id, instrument, title, artist, content)
       VALUES ($1, 'guitar', $2, $3, $4)
       ON CONFLICT (song_id, instrument) DO UPDATE SET content = EXCLUDED.content`,
      [song.id, title, artist, content],
    );

    res.status(201).json({ song: serializeSong(song), existed: false });
  } catch (e) {
    console.error('[import/from-url] insert', e);
    res.status(500).json({ message: 'Error al guardar la canción' });
  }
});

export default router;
