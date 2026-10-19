// Reporta errores del navegador al backend (señal `client_error`), que el reporte semanal agrega.
// Nunca debe romper la app ni mandar datos personales: solo mensaje recortado, origen y ruta normalizada.

import { getApiBase } from './appUrl';

const MAX_REPORTS_PER_SESSION = 5;
const sent = new Set<string>();

export type ClientErrorSource = 'boundary' | 'window' | 'unhandledrejection';

/** `/song/123?x=1` → `/song/:id`: agrupa por pantalla, no por recurso. */
export const normalizeRoute = (hashOrPath: string): string =>
  (hashOrPath.replace(/^#/, '').split('?')[0] || '/')
    .replace(/\/\d+(?=\/|$)/g, '/:id')
    .replace(/\/[a-f0-9]{16,}(?=\/|$)/gi, '/:token')
    .slice(0, 100);

export const scrubMessage = (message: string): string =>
  message
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]')
    .replace(/\b\d{6,}\b/g, '[n]')
    .slice(0, 200);

export function reportClientError(error: unknown, source: ClientErrorSource): void {
  try {
    const raw = error instanceof Error ? `${error.name}: ${error.message}` : String(error ?? 'unknown');
    const message = scrubMessage(raw);
    const route = normalizeRoute(window.location.hash || window.location.pathname);
    const key = `${source}|${message}|${route}`;
    if (sent.has(key) || sent.size >= MAX_REPORTS_PER_SESSION) return;
    sent.add(key);

    void fetch(`${getApiBase()}/signals/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, source, route }),
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    /* reportar nunca debe fallar */
  }
}

let installed = false;
export function installGlobalErrorReporting(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (e) => reportClientError(e.error ?? e.message, 'window'));
  window.addEventListener('unhandledrejection', (e) => reportClientError(e.reason, 'unhandledrejection'));
}

/** Solo para tests. */
export const __resetErrorReporter = () => sent.clear();
