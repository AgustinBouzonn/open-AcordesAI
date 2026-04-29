import { Router, Request, Response } from 'express';
import { importLimiter } from '../middleware/rateLimit';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { query } from '../db';
import { serializeSong } from '../serializers/song';

const router = Router();

const ALLOWED_HOSTS = new Set([
  'www.ultimateguitar.com',
  'www.cifraclub.com',
  'www.cifraclub.com.br',
  'cifraspot.com',
]);

const isAllowedImportUrl = (value: string, source?: string): boolean => {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) {
      return false;
    }

    if (!ALLOWED_HOSTS.has(parsed.hostname)) {
      return false;
    }

    if (!source) {
      return true;
    }

    const sourceConfig = SOURCES.find(s => s.id === source);
    if (!sourceConfig) {
      return false;
    }

    return new URL(sourceConfig.baseUrl).hostname === parsed.hostname;
  } catch {
    return false;
  }
};

const SOURCES = [
  {
    id: 'ultimateguitar',
    name: 'Ultimate Guitar',
    baseUrl: 'https://www.ultimateguitar.com',
    searchUrl: 'https://www.ultimateguitar.com/search.php?search_type=title&value=',
    parse: (html: string) => {
      const chords: string[] = [];
      const preMatch = html.match(/<pre[^>]*class="js-tab-content"[^>]*>([\s\S]*?)<\/pre>/);
      if (preMatch) {
        const clean = preMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        chords.push(clean);
      }
      return chords;
    }
  },
  {
    id: 'cifraclub',
    name: 'Cifra Club',
    baseUrl: 'https://www.cifraclub.com',
    searchUrl: 'https://www.cifraclub.com/?q=',
    parse: (html: string) => {
      const chords: string[] = [];
      
      const preMatch = html.match(/<pre[^>]*class="[^"]*chords[^"]*"[^>]*>([\s\S]*?)<\/pre>/i);
      if (preMatch) {
        const clean = preMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>');
        chords.push(clean);
      }

      if (chords.length === 0) {
        const divMatch = html.match(/<div[^>]*data-sheet[^>]*>([\s\S]*?)<\/div>/i);
        if (divMatch) {
          const clean = divMatch[1]
            .replace(/<[^>]+>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&');
          chords.push(clean);
        }
      }

      if (chords.length === 0) {
        const scriptMatch = html.match(/__INITIAL_DATA__["\s:]*({[\s\S]*?"chords"[\s\S]*?})/);
        if (scriptMatch) {
          try {
            const data = JSON.parse(scriptMatch[1]);
            if (data.chords) chords.push(data.chords);
          } catch {}
        }
      }

      return chords;
    }
  },
  {
    id: 'cifraspot',
    name: 'CifraSpot',
    baseUrl: 'https://cifraspot.com',
    searchUrl: 'https://cifraspot.com/search?q=',
    parse: (html: string) => {
      const chords: string[] = [];
      const preMatch = html.match(/<pre[^>]*class="chord"[^>]*>([\s\S]*?)<\/pre>/);
      if (preMatch) {
        chords.push(preMatch[1].replace(/<[^>]+>/g, ''));
      }
      return chords;
    }
  }
];

router.get('/sources', (_, res) => {
  res.json(SOURCES.map(s => ({ id: s.id, name: s.name, baseUrl: s.baseUrl })));
});

router.post('/fetch', importLimiter, async (req: Request, res: Response) => {
  const { url, source } = req.body;
  
  if (!url) {
    res.status(400).json({ message: 'URL es requerida' });
    return;
  }

  if (!isAllowedImportUrl(url, source)) {
    res.status(400).json({ message: 'URL no permitida' });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      res.status(502).json({ message: `La fuente respondió ${response.status}` });
      return;
    }

    const html = await response.text();
    const chords = extractLargestPre(html);

    if (!chords) {
      res.status(422).json({ message: 'No se encontró cifrado en la página' });
      return;
    }

    res.json({ chords: chords.substring(0, 50000) });
  } catch (e) {
    console.error('[import/fetch]', e);
    res.status(500).json({ message: 'Error al importar cifrado' });
  }
});

router.get('/search/:source', importLimiter, async (req: Request, res: Response) => {
  const { source } = req.params;
  const query = typeof req.query.q === 'string' ? req.query.q : '';
  
  if (!query) {
    res.status(400).json({ message: 'Query requerida' });
    return;
  }

  const sourceConfig = SOURCES.find(s => s.id === source);
  if (!sourceConfig) {
    res.status(400).json({ message: 'Fuente no soportada' });
    return;
  }

  try {
    const searchUrl = sourceConfig.searchUrl + encodeURIComponent(query);
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    const html = await response.text();
    const results: Array<{ title: string; artist: string; url: string }> = [];

    if (source === 'ultimateguitar') {
      const matches = html.matchAll(/href="(\/tabs\/[^"]+)"[^>]*>([^<]+)<\/a>/g);
      for (const match of Array.from(matches).slice(0, 10)) {
        results.push({
          title: match[2].trim(),
          artist: 'Unknown',
          url: sourceConfig.baseUrl + match[1]
        });
      }
    } else if (source === 'cifraclub') {
      const matches = html.matchAll(/href="(\/[^"]+)"[^>]*>([^<]+)<\/a>/g);
      for (const match of Array.from(matches).slice(0, 10)) {
        if (match[1].startsWith('/')) {
          results.push({
            title: match[2].trim(),
            artist: 'Unknown',
            url: sourceConfig.baseUrl + match[1]
          });
        }
      }
    }

    res.json({ results: results.slice(0, 10) });
  } catch (e) {
    console.error('[import/search]', e);
    res.status(500).json({ message: 'Error en búsqueda' });
  }
});

const stripTags = (s: string) =>
  s
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const cleanTitlePart = (s: string) =>
  s.replace(/\s*\((?:acordes|cifra|tab|tabs|letra|chords)\)\s*$/i, '').trim();

const parseOgTitle = (html: string): { title: string; artist: string } | null => {
  const m = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  if (!m) return null;
  const raw = m[1].replace(/\s*[-|]\s*Cifra Club.*$/i, '').trim();
  const parts = raw.split(/\s+-\s+/);
  if (parts.length >= 2) {
    return { title: cleanTitlePart(parts[0]), artist: cleanTitlePart(parts.slice(1).join(' - ')) };
  }
  return { title: cleanTitlePart(raw), artist: '' };
};

const extractLargestPre = (html: string): string | null => {
  const pres = [...html.matchAll(/<pre[^>]*>([\s\S]*?)<\/pre>/gi)].map((m) => stripTags(m[1]).trim());
  if (!pres.length) return null;
  pres.sort((a, b) => b.length - a.length);
  return pres[0].length >= 100 ? pres[0] : null;
};

router.post('/from-url', requireAuth, importLimiter, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Debes iniciar sesión' });
    return;
  }

  const { url } = req.body ?? {};
  if (typeof url !== 'string' || !url.trim()) {
    res.status(400).json({ message: 'URL es requerida' });
    return;
  }

  if (!isAllowedImportUrl(url)) {
    res.status(400).json({ message: 'URL no permitida. Fuentes aceptadas: Cifra Club, Ultimate Guitar, CifraSpot.' });
    return;
  }

  const existing = await query('SELECT * FROM songs WHERE source_url = $1 LIMIT 1', [url]);
  if (existing.rows.length) {
    res.status(200).json({ song: serializeSong(existing.rows[0]), existed: true });
    return;
  }

  let html: string;
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    const response = await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,*/*',
      },
    });
    clearTimeout(timeout);
    if (!response.ok) {
      res.status(502).json({ message: `La fuente respondió ${response.status}` });
      return;
    }
    html = await response.text();
  } catch (e) {
    console.error('[import/from-url] fetch', e);
    res.status(502).json({ message: 'No se pudo acceder a la URL' });
    return;
  }

  const content = extractLargestPre(html);
  if (!content) {
    res.status(422).json({ message: 'No se encontró cifrado en la página' });
    return;
  }

  const og = parseOgTitle(html);
  const title = og?.title || 'Sin título';
  const artist = og?.artist || 'Desconocido';

  try {
    const inserted = await query(
      `INSERT INTO songs (title, artist, lyrics, source, source_url, user_id)
       VALUES ($1, $2, $3, 'cifraclub', $4, $5)
       RETURNING *`,
      [title, artist, content, url, userId]
    );
    const song = inserted.rows[0];

    await query(
      `INSERT INTO chord_cache (song_id, instrument, title, artist, content)
       VALUES ($1, 'guitar', $2, $3, $4)
       ON CONFLICT (song_id, instrument) DO UPDATE SET content = EXCLUDED.content`,
      [song.id, title, artist, content]
    );

    res.status(201).json({ song: serializeSong(song), existed: false });
  } catch (e) {
    console.error('[import/from-url] insert', e);
    res.status(500).json({ message: 'Error al guardar la canción' });
  }
});

export default router;
