import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { api, onAuthError } from '../services/apiClient';
import { isNativeApp, parseNativeAuthCallback } from '../services/nativeAuth';
import { OAuthProvider, User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => void;
  completeOAuth: (token: string) => Promise<void>;
  logout: () => void;
  updateProvider: (provider: string, apiKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.auth.me()
        .then((data) => setUser(data.user))
        .catch(() => api.setToken(null))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    const off = onAuthError(() => setUser(null));
    return () => { off(); };
  }, []);

  // App nativa: el login social vuelve por deep link con un código de un solo uso, que se canjea
  // por la sesión. Los errores se muestran en la misma pantalla que usa la web.
  useEffect(() => {
    if (!isNativeApp()) return undefined;
    let active = true;
    const showError = (message: string) => {
      window.location.hash = `#/auth/callback?${new URLSearchParams({ error: message }).toString()}`;
    };
    const listener = CapacitorApp.addListener('appUrlOpen', ({ url }) => {
      const result = parseNativeAuthCallback(url);
      if (!result) return;
      Browser.close().catch(() => { /* en Android puede no estar abierto */ });
      if ('error' in result) { showError(result.error); return; }
      api.auth.exchangeNativeCode(result.code)
        .then((data) => {
          if (!active) return;
          api.setToken(data.token);
          setUser(data.user);
          window.location.hash = '#/';
        })
        .catch(() => { if (active) showError('No se pudo completar el inicio de sesión social'); });
    });
    return () => {
      active = false;
      listener.then((handle) => handle.remove()).catch(() => { /* noop */ });
    };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    api.setToken(data.token);
    setUser(data.user);
  };

  const register = async (username: string, email: string, password: string) => {
    const data = await api.auth.register(username, email, password);
    api.setToken(data.token);
    setUser(data.user);
  };

  const loginWithOAuth = (provider: OAuthProvider) => {
    // Google bloquea OAuth dentro de WebViews: en la app nativa se abre el navegador del sistema.
    if (isNativeApp()) {
      Browser.open({ url: api.auth.getOAuthStartUrl(provider, { native: true }) }).catch(() => { /* noop */ });
      return;
    }
    window.location.replace(api.auth.getOAuthStartUrl(provider));
  };

  const completeOAuth = async (token: string) => {
    api.setToken(token);
    const data = await api.auth.me();
    setUser(data.user);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const updateProvider = async (provider: string, apiKey: string) => {
    await api.auth.updateProvider(provider, apiKey);
    const data = await api.auth.me();
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithOAuth, completeOAuth, logout, updateProvider }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
