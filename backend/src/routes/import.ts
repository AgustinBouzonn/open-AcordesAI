import { Router, Request, Response } from 'express';
import dns from 'node:dns/promises';
import net from 'node:net';
import { requireAuth } from '../middleware/auth';

const router = Router();

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
      const preMatch = html.match(/<div[^>]*class="cifra"[^>]*>([\s\S]*?)<\/div>/);
      if (preMatch) {
        const clean = preMatch[1]
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&');
        chords.push(clean);
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

const isPrivateHostname = (hostname: string): boolean =>
  hostname === 'localhost' ||
  hostname.endsWith('.local') ||
  hostname === '0.0.0.0';

const isPrivateIp = (ip: string): boolean => {
  if (net.isIP(ip) === 4) {
    return (
      ip.startsWith('10.') ||
      ip.startsWith('127.') ||
      ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
    );
  }

  if (net.isIP(ip) === 6) {
    return ip === '::1' || ip.startsWith('fc') || ip.startsWith('fd') || ip.startsWith('fe80:');
  }

  return false;
};

const validateImportUrl = async (rawUrl: string): Promise<URL> => {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('La URL no es válida');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Solo se permiten URLs http o https');
  }

  if (isPrivateHostname(parsed.hostname)) {
    throw new Error('No se permiten URLs locales o privadas');
  }

  const addresses = await dns.lookup(parsed.hostname, { all: true });
  if (addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new Error('No se permiten destinos de red privada');
  }

  return parsed;
};

const detectSourceFromUrl = (url: URL): string | undefined =>
  SOURCES.find((source) => url.hostname.includes(new URL(source.baseUrl).hostname.replace(/^www\./, '')))?.id;

router.get('/sources', (_, res) => {
  res.json(SOURCES.map(s => ({ id: s.id, name: s.name, baseUrl: s.baseUrl })));
});

router.post('/fetch', requireAuth, async (req: Request, res: Response) => {
  const { url, source } = req.body;
  
  if (!url) {
    res.status(400).json({ message: 'URL es requerida' });
    return;
  }

  try {
    const validatedUrl = await validateImportUrl(url);
    const sourceId = typeof source === 'string' && source ? source : detectSourceFromUrl(validatedUrl);

    const response = await fetch(validatedUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      res.status(502).json({ message: 'Error al obtener la página' });
      return;
    }

    const html = await response.text();
    
    let chords = '';
    const sourceConfig = SOURCES.find(s => s.id === sourceId);
    
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
    const message = e instanceof Error ? e.message : 'Error al importar cifrado';
    const status = message.includes('URL') || message.includes('privad') || message.includes('http o https') ? 400 : 500;
    res.status(status).json({ message });
  }
});

router.get('/search/:source', async (req: Request, res: Response) => {
  const { source } = req.params;
  const query = req.query.q as string;
  
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
      signal: AbortSignal.timeout(10000),
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
