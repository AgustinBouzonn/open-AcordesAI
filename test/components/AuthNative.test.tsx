import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Login social en la app nativa: Google bloquea OAuth dentro de WebViews, así que se abre el
// navegador del sistema y la sesión vuelve por deep link con un código de un solo uso.

const mocks = vi.hoisted(() => ({
  native: false,
  listener: null as null | ((event: { url: string }) => void),
  open: vi.fn(() => Promise.resolve()),
  close: vi.fn(() => Promise.resolve()),
  remove: vi.fn(() => Promise.resolve()),
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => mocks.native },
}));
vi.mock('@capacitor/browser', () => ({
  Browser: { open: mocks.open, close: mocks.close },
}));
vi.mock('@capacitor/app', () => ({
  App: {
    addListener: (_event: string, fn: (event: { url: string }) => void) => {
      mocks.listener = fn;
      return Promise.resolve({ remove: mocks.remove });
    },
  },
}));

import { AuthProvider, useAuth } from '../../components/AuthContext';
import { api } from '../../services/apiClient';

const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

const jsonResponse = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

describe('login social en la app nativa', () => {
  const fetchMock = vi.fn();
  const replace = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    mocks.native = true;
    mocks.listener = null;
    mocks.open.mockClear();
    mocks.close.mockClear();
    fetchMock.mockReset();
    replace.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('VITE_NATIVE_API_URL', 'https://acordes.example/api');
    api.setToken(null);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, origin: 'https://localhost', hash: '', replace },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    api.setToken(null);
    mocks.native = false;
  });

  it('abre el navegador del sistema con el flujo nativo, no la WebView', () => {
    const { result } = renderAuth();

    result.current.loginWithOAuth('google');

    expect(mocks.open).toHaveBeenCalledWith({ url: 'https://acordes.example/api/auth/oauth/google/start?platform=native' });
    expect(replace).not.toHaveBeenCalled();
  });

  it('canjea el código del deep link y deja la sesión iniciada', async () => {
    fetchMock.mockImplementation(() => jsonResponse({ token: 'jwt-nativo', user: { id: 7, email: 'a@b.c', username: 'octo' } }));
    const { result } = renderAuth();
    await waitFor(() => expect(mocks.listener).not.toBeNull());

    mocks.listener!({ url: 'com.acordesai.app://auth/callback?code=el-codigo' });

    await waitFor(() => expect(result.current.user?.username).toBe('octo'));
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://acordes.example/api/auth/oauth/native/exchange');
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ code: 'el-codigo' });
    expect(api.getToken()).toBe('jwt-nativo');
    expect(mocks.close).toHaveBeenCalled();
    expect(window.location.hash).toBe('#/');
  });

  it('muestra el error que devuelve el deep link', async () => {
    renderAuth();
    await waitFor(() => expect(mocks.listener).not.toBeNull());

    mocks.listener!({ url: 'com.acordesai.app://auth/callback?error=Algo+fall%C3%B3' });

    expect(window.location.hash).toBe(`#/auth/callback?${new URLSearchParams({ error: 'Algo falló' }).toString()}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ignora deep links que no son el callback de login', async () => {
    renderAuth();
    await waitFor(() => expect(mocks.listener).not.toBeNull());

    mocks.listener!({ url: 'com.acordesai.app://song/123' });
    mocks.listener!({ url: 'https://evil.example/auth/callback?code=x' });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(mocks.close).not.toHaveBeenCalled();
  });
});

describe('login social en la web', () => {
  const replace = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    mocks.native = false;
    mocks.listener = null;
    mocks.open.mockClear();
    replace.mockReset();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, origin: 'https://acordes.example', replace },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    vi.unstubAllEnvs();
  });

  it('sigue redirigiendo la página y no escucha deep links', () => {
    vi.stubEnv('VITE_API_URL', '/api');
    const { result } = renderAuth();

    result.current.loginWithOAuth('github');

    expect(replace).toHaveBeenCalledWith('https://acordes.example/api/auth/oauth/github/start');
    expect(mocks.open).not.toHaveBeenCalled();
    expect(mocks.listener).toBeNull();
  });
});
