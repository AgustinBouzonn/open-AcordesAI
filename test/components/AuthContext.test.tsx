import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../components/AuthContext';

// Regresión: el login social armaba la URL con window.location.origin e ignoraba
// VITE_API_URL. En una app nativa empaquetada local el origen es https://localhost,
// así que el login iba a un backend que no existe.

function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

describe('AuthContext.loginWithOAuth', () => {
  const replace = vi.fn();
  const originalLocation = window.location;

  beforeEach(() => {
    replace.mockReset();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, origin: 'https://localhost', replace },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation });
    vi.unstubAllEnvs();
  });

  it('usa VITE_API_URL cuando es absoluta', async () => {
    vi.stubEnv('VITE_API_URL', 'https://acordes.example/api');
    const { result } = renderAuth();

    result.current.loginWithOAuth('github');

    expect(replace).toHaveBeenCalledWith('https://acordes.example/api/auth/oauth/github/start');
  });

  it('con la API relativa sigue usando el origen de la página', async () => {
    vi.stubEnv('VITE_API_URL', '/api');
    const { result } = renderAuth();

    result.current.loginWithOAuth('google');

    expect(replace).toHaveBeenCalledWith('https://localhost/api/auth/oauth/google/start');
  });
});
