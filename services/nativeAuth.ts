import { Capacitor } from '@capacitor/core';

/**
 * Deep link al que vuelve el login social iniciado desde la app nativa. El esquema es el appId de
 * capacitor.config.ts y tiene que coincidir con el intent-filter de AndroidManifest.xml y con
 * NATIVE_APP_SCHEME del backend.
 */
export const NATIVE_AUTH_CALLBACK = 'com.acordesai.app://auth/callback';

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

export type NativeAuthResult = { code: string } | { error: string };

/**
 * Lee la URL con la que Android abrió la app. Devuelve null si no es el callback de login,
 * para que otros deep links sigan su curso.
 */
export function parseNativeAuthCallback(url: string): NativeAuthResult | null {
  if (!url.startsWith(NATIVE_AUTH_CALLBACK)) return null;
  const rest = url.slice(NATIVE_AUTH_CALLBACK.length);
  if (rest && !rest.startsWith('?')) return null;
  const params = new URLSearchParams(rest.slice(1));
  const error = params.get('error');
  if (error) return { error };
  const code = params.get('code');
  if (code) return { code };
  return { error: 'No se recibió el código de autenticación' };
}
