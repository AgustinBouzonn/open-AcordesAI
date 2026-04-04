import { Router, Request, Response } from 'express';
import { importLimiter } from '../middleware/rateLimit';

const router = Router();

const ALLOWED_HOSTS = new Set([
  'www.ultimateguitar.com',
  'www.cifraclub.com',
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
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'error',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    clearTimeout(timeout);

    if (!response.ok) {
      res.status(502).json({ message: 'Error al obtener la página' });
      return;
    }

    const html = await response.text();
    
    let chords = '';
    const sourceConfig = SOURCES.find(s => s.id === source);
    
    if (sourceConfig) {
      const parsed = sourceConfig.parse(html);
      chords = parsed.join('\n\n');
    } else {
      const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (preMatch) {
        chords = preMatch[1].replace(/<[^>]+>/g, '').substring(0, 50000);
      }
    }

    if (!chords) {
      chords = html.substring(0, 10000).replace(/<[^>]+>/g, ' ');
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

export default router;
