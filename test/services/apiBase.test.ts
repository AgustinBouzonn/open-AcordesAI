import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Regresión: VITE_NATIVE_API_URL figuraba en .env.example y en la doc de Android,
// pero ningún módulo la leía. En la app nativa la API tiene que poder apuntar a un
// backend absoluto sin cambiar VITE_API_URL del build web.

const native = { value: false };
vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => native.value },
}));

import { api } from '../../services/apiClient';

describe('base de la API', () => {
  const fetchMock = vi.fn(() =>
    Promise.resolve(new Response(JSON.stringify({ results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } })),
  );

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    native.value = false;
  });

  const calledUrl = () => (fetchMock.mock.calls[0] as unknown as [string])[0];

  it('en la app nativa usa VITE_NATIVE_API_URL', async () => {
    native.value = true;
    vi.stubEnv('VITE_API_URL', '/api');
    vi.stubEnv('VITE_NATIVE_API_URL', 'https://acordes.example/api/');

    await api.search.songs('zamba');

    expect(calledUrl()).toBe('https://acordes.example/api/search?q=zamba');
  });

  it('en la web ignora VITE_NATIVE_API_URL', async () => {
    native.value = false;
    vi.stubEnv('VITE_API_URL', '/api');
    vi.stubEnv('VITE_NATIVE_API_URL', 'https://acordes.example/api');

    await api.search.songs('zamba');

    expect(calledUrl()).toBe('/api/search?q=zamba');
  });

  it('en la app nativa sin VITE_NATIVE_API_URL usa VITE_API_URL', async () => {
    native.value = true;
    vi.stubEnv('VITE_API_URL', 'https://otro.example/api');
    vi.stubEnv('VITE_NATIVE_API_URL', '');

    await api.search.songs('zamba');

    expect(calledUrl()).toBe('https://otro.example/api/search?q=zamba');
  });

  it('el inicio del login social usa la misma base en la app nativa', () => {
    native.value = true;
    vi.stubEnv('VITE_NATIVE_API_URL', 'https://acordes.example/api');

    expect(api.auth.getOAuthStartUrl('google')).toBe('https://acordes.example/api/auth/oauth/google/start');
  });
});
