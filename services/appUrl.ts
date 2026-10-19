/**
 * URL pública de la app, usada para armar enlaces que se comparten fuera de ella.
 *
 * Si VITE_PUBLIC_APP_URL está definida (por ejemplo en el build de Android), se usa esa.
 * Si no, se usa el origen de la página, que es lo correcto en la web.
 * Un valor que no sea http(s), como `capacitor://localhost`, se ignora porque no
 * sirve como enlace para otra persona.
 */
export function getPublicAppUrl(): string {
  const configured = String(import.meta.env.VITE_PUBLIC_APP_URL ?? '').trim();
  if (/^https?:\/\//i.test(configured)) {
    return configured.replace(/\/+$/, '');
  }
  return window.location.origin;
}

/** Enlace compartible a una ruta hash de la app, por ejemplo `/song/123`. */
export function buildShareUrl(path: string): string {
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${getPublicAppUrl()}/#${route}`;
}
