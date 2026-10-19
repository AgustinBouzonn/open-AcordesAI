import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildShareUrl, getPublicAppUrl } from '../../services/appUrl';

describe('getPublicAppUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('usa VITE_PUBLIC_APP_URL cuando está definida', () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', 'https://acordes.example');
    expect(getPublicAppUrl()).toBe('https://acordes.example');
  });

  it('quita las barras finales de la URL configurada', () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', 'https://acordes.example///');
    expect(getPublicAppUrl()).toBe('https://acordes.example');
  });

  it('usa el origen de la página cuando la variable está vacía', () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', '');
    expect(getPublicAppUrl()).toBe(window.location.origin);
  });

  it('ignora valores que no son URLs http(s), como el origen de Capacitor', () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', 'capacitor://localhost');
    expect(getPublicAppUrl()).toBe(window.location.origin);
  });
});

describe('buildShareUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('arma la ruta hash sobre la URL pública', () => {
    vi.stubEnv('VITE_PUBLIC_APP_URL', 'https://acordes.example');
    expect(buildShareUrl('/song/abc')).toBe('https://acordes.example/#/song/abc');
    expect(buildShareUrl('shared/setlist/tok')).toBe('https://acordes.example/#/shared/setlist/tok');
  });
});
