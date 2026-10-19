// "Novedades" de la landing: sale de los PRs mergeados a main. Sin red o sin token devuelve null
// y la página muestra el enlace a GitHub en lugar de fallar el deploy.

export interface MergedPr {
  number: number;
  title: string;
  url: string;
  author: string;
  mergedAt: string;
}

export interface ChangelogItem {
  number: number;
  url: string;
  kind: 'Nuevo' | 'Arreglo' | 'Mejora' | 'Interno';
  text: string;
}

export interface ChangelogMonth {
  label: string;
  items: ChangelogItem[];
  dependencyUpdates: number;
}

const KIND_BY_TYPE: Record<string, ChangelogItem['kind']> = {
  feat: 'Nuevo',
  fix: 'Arreglo',
  perf: 'Mejora',
  docs: 'Interno',
  chore: 'Interno',
  ci: 'Interno',
  build: 'Interno',
  refactor: 'Interno',
  test: 'Interno',
  style: 'Interno',
};

const BOTS = new Set(['dependabot[bot]', 'renovate[bot]']);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * "fix(ui): arregla X" → { kind: 'Arreglo', text: 'Arregla X' }.
 * También limpia los títulos de los agentes de Jules ("🛡️ Sentinel: [HIGH] Fix …"). El resto cuenta como mejora.
 */
export function classifyTitle(title: string): Pick<ChangelogItem, 'kind' | 'text'> {
  const conventional = title.match(/^(\w+)(?:\([^)]*\))?(?:\s*\+\s*\w+(?:\([^)]*\))?)*!?:\s*(.+)$/);
  const type = conventional?.[1].toLowerCase();
  if (conventional && type && KIND_BY_TYPE[type]) {
    return { kind: KIND_BY_TYPE[type], text: capitalize(conventional[2].trim()) };
  }
  let text = title.replace(/^[^\p{L}\p{N}[]+/u, '');
  let kind: ChangelogItem['kind'] = 'Mejora';
  const persona = text.match(/^(Sentinel|Bolt|Palette):\s*(.+)$/);
  if (persona) {
    text = persona[2];
    if (persona[1] === 'Sentinel') kind = 'Arreglo';
  }
  text = text.replace(/^\[[A-Z]+\]\s*/, '').trim();
  return { kind, text: capitalize(text) };
}

export function groupByMonth(prs: MergedPr[]): ChangelogMonth[] {
  const months = new Map<string, ChangelogMonth>();
  const sorted = [...prs].sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
  for (const pr of sorted) {
    const date = new Date(pr.mergedAt);
    const key = pr.mergedAt.slice(0, 7);
    let month = months.get(key);
    if (!month) {
      const label = date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
      month = { label: label.charAt(0).toUpperCase() + label.slice(1), items: [], dependencyUpdates: 0 };
      months.set(key, month);
    }
    if (BOTS.has(pr.author)) {
      month.dependencyUpdates += 1;
    } else {
      month.items.push({ number: pr.number, url: pr.url, ...classifyTitle(pr.title) });
    }
  }
  return [...months.values()];
}

interface SearchItem {
  number: number;
  title: string;
  html_url: string;
  user: { login: string } | null;
  pull_request?: { merged_at: string | null };
}

export async function fetchMergedPrs(repo: string, token?: string): Promise<MergedPr[] | null> {
  const q = encodeURIComponent(`repo:${repo} is:pr is:merged base:main`);
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'acordesai-landing' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`https://api.github.com/search/issues?q=${q}&sort=created&order=desc&per_page=100`, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { items: SearchItem[] };
    return body.items
      .filter((i) => i.pull_request?.merged_at)
      .map((i) => ({
        number: i.number,
        title: i.title,
        url: i.html_url,
        author: i.user?.login ?? '',
        mergedAt: i.pull_request!.merged_at!,
      }));
  } catch (e) {
    console.warn(`[landing] No se pudieron leer los PRs (${(e as Error).message}); Novedades queda con el enlace a GitHub.`);
    return null;
  }
}

export interface LatestApk {
  url: string;
  version: string;
}

/** APK del último GitHub Release (lo publica android-release.yml). null si todavía no hay ninguno. */
export async function fetchLatestApk(repo: string, token?: string): Promise<LatestApk | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'acordesai-landing' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const release = (await res.json()) as { tag_name: string; assets: Array<{ name: string; browser_download_url: string }> };
    const apk = release.assets.find((a) => a.name.endsWith('.apk'));
    return apk ? { url: apk.browser_download_url, version: release.tag_name } : null;
  } catch (e) {
    console.warn(`[landing] No se pudo leer el último release (${(e as Error).message}); el APK sigue saliendo del servidor.`);
    return null;
  }
}
