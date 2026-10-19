import { Capacitor } from '@capacitor/core';

const isHttpUrl = (value: string): boolean => /^https?:\/\//i.test(value);
const trimSlash = (value: string): string => value.replace(/\/+$/, '');

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
  if (isHttpUrl(configured)) {
    return trimSlash(configured);
  }
  return window.location.origin;
}

/** Enlace compartible a una ruta hash de la app, por ejemplo `/song/123`. */
export function buildShareUrl(path: string): string {
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${getPublicAppUrl()}/#${route}`;
}

/**
 * Base de la API, sin barra final.
 *
 * En la app nativa (Capacitor) se usa VITE_NATIVE_API_URL si es una URL http(s), para
 * que un build empaquetado local llegue al backend aunque su origen sea `https://localhost`.
 * En cualquier otro caso se usa VITE_API_URL, o `/api` si está vacía.
 * Se lee en cada llamada para que el valor configurado nunca quede congelado.
 */
export function getApiBase(): string {
  const nativeUrl = String(import.meta.env.VITE_NATIVE_API_URL ?? '').trim();
  if (Capacitor.isNativePlatform() && isHttpUrl(nativeUrl)) {
    return trimSlash(nativeUrl);
  }
  const configured = String(import.meta.env.VITE_API_URL ?? '').trim();
  return trimSlash(configured || '/api');
}

/** Base de la API como URL absoluta: las rutas relativas se resuelven contra el origen de la página. */
export function getAbsoluteApiBase(): string {
  const base = getApiBase();
  return isHttpUrl(base) ? base : `${window.location.origin}${base}`;
}
