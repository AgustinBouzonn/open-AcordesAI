import { query } from '../db';

export type SignalKind = 'import_failed' | 'search_empty' | 'ai_failed' | 'chords_edited' | 'client_error';

// En tests unitarios (DB mockeada) no se registra nada salvo que se pida con SIGNALS_ENABLED=1.
const enabled = () => process.env.NODE_ENV !== 'test' || process.env.SIGNALS_ENABLED === '1';

/**
 * Registra una señal de producto sin bloquear ni romper el request.
 * No incluir datos personales en `detail`: el reporte semanal se publica en un issue.
 */
export function recordSignal(kind: SignalKind, detail: Record<string, string | number | null>): Promise<void> {
  if (!enabled()) return Promise.resolve();
  return Promise.resolve()
    .then(() => query('INSERT INTO product_events (kind, detail) VALUES ($1, $2::jsonb)', [kind, JSON.stringify(detail)]))
    .then(() => undefined)
    .catch((e) => console.error('[signals]', kind, e));
}

export const hostAndPath = (rawUrl: string): { host: string; path: string } => {
  try {
    const u = new URL(/^https?:\/\//i.test(rawUrl.trim()) ? rawUrl.trim() : `https://${rawUrl.trim()}`);
    return { host: u.hostname.toLowerCase().slice(0, 100), path: u.pathname.slice(0, 200) };
  } catch {
    return { host: 'invalid', path: '' };
  }
};
