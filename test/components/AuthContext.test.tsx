import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '../../components/AuthContext';

// Regresión: el login social armaba la URL con window.location.origin e ignoraba
// VITE_API_URL. En una app nativa empaquetada local el origen es https://localhost,
// así que el login iba a un backend que no existe.

let auth: ReturnType<typeof useAuth> | null = null;
function Capture() {
  auth = useAuth();
  return null;
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
    auth = null;
  });

  it('usa VITE_API_URL cuando es absoluta', async () => {
    vi.stubEnv('VITE_API_URL', 'https://acordes.example/api');
    await act(async () => { render(<AuthProvider><Capture /></AuthProvider>); });

    auth!.loginWithOAuth('github');

    expect(replace).toHaveBeenCalledWith('https://acordes.example/api/auth/oauth/github/start');
  });

  it('con la API relativa sigue usando el origen de la página', async () => {
    vi.stubEnv('VITE_API_URL', '/api');
    await act(async () => { render(<AuthProvider><Capture /></AuthProvider>); });

    auth!.loginWithOAuth('google');

    expect(replace).toHaveBeenCalledWith('https://localhost/api/auth/oauth/google/start');
  });
});
