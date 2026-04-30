import { Comment, Instrument, OAuthProvider, ProfileStats, RatingSummary, Song, User } from '../types';
import { safeStorage } from './safeStorage';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'token';

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

interface SearchSongsResponse {
  results: Song[];
}

interface ImportResponse {
  chords?: string;
}

interface MessageResponse {
  message: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

type AuthListener = (reason: 'expired' | 'invalid' | 'unauthorized') => void;
const authListeners = new Set<AuthListener>();

export const onAuthError = (fn: AuthListener) => {
  authListeners.add(fn);
  return () => authListeners.delete(fn);
};

class ApiClient {
  private token: string | null = null;

  private getAbsoluteApiBase(): string {
    if (/^https?:\/\//.test(API_BASE)) {
      return API_BASE.replace(/\/$/, '');
    }
    return `${window.location.origin}${API_BASE}`.replace(/\/$/, '');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) safeStorage.set(TOKEN_KEY, token);
    else safeStorage.remove(TOKEN_KEY);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = safeStorage.get(TOKEN_KEY);
    }
    return this.token;
  }

  private async doFetch(endpoint: string, options: RequestInit, withAuth: boolean): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };
    if (withAuth) {
      const token = this.getToken();
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    let response: Response;
    try {
      response = await this.doFetch(endpoint, options, true);
    } catch (e) {
      try {
        response = await this.doFetch(endpoint, options, true);
      } catch (e2) {
        throw new ApiError(
          e2 instanceof Error ? e2.message : 'Sin conexión',
          0,
        );
      }
    }

    if (!response.ok) {
      const body = await response.json().catch(() => ({} as Record<string, unknown>));
      const message = (body as { message?: string; error?: string }).message
        || (body as { error?: string }).error
        || 'Request failed';
      const code = (body as { code?: string }).code;

      if (response.status === 401) {
        const reason: 'expired' | 'invalid' | 'unauthorized' =
          code === 'TOKEN_EXPIRED' ? 'expired' :
          code === 'TOKEN_INVALID' ? 'invalid' : 'unauthorized';
        if (this.token) {
          this.setToken(null);
          authListeners.forEach((fn) => { try { fn(reason); } catch { /* noop */ } });
        }
      }

      throw new ApiError(message, response.status, code);
    }

    return response.json() as Promise<T>;
  }

  auth = {
    register: (username: string, email: string, password: string) =>
      this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      }),
    login: (email: string, password: string) =>
      this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => this.request<MeResponse>('/auth/me'),
    stats: () => this.request<ProfileStats>('/auth/stats'),
    getOAuthStartUrl: (provider: OAuthProvider) => `${this.getAbsoluteApiBase()}/auth/oauth/${provider}/start`,
    getOAuthRedirect: async (provider: OAuthProvider) => {
      const response = await fetch(`${this.getAbsoluteApiBase()}/auth/oauth/${provider}/start`, {
        method: 'GET',
        credentials: 'include',
      });
      const url = response.url;
      window.location.href = url;
      return url;
    },
    updateProvider: (provider: string, apiKey: string) =>
      this.request<MessageResponse>('/auth/provider', {
        method: 'POST',
        body: JSON.stringify({ provider, apiKey }),
      }),
  };

  search = {
    songs: (query: string) => this.request<SearchSongsResponse>(`/search?q=${encodeURIComponent(query)}`),
  };

  config = {
    get: () => this.request<{ status: string; aiConfigured: boolean }>('/health'),
  };

  backup = {
    export: () => fetch(`${API_BASE}/auth/export`, { headers: { Authorization: `Bearer ${this.getToken()}` } }).then((r) => r.json()),
    import: (data: unknown) => this.request<{ message: string; imported: { favorites: number; ratings: number; setlists: number } }>('/auth/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  };

  imports = {
    fetch: (url: string, source?: string) =>
      this.request<ImportResponse>('/import/fetch', {
        method: 'POST',
        body: JSON.stringify({ url, source }),
      }),
    fromUrl: (url: string) =>
      this.request<{ song: Song; existed: boolean }>('/import/from-url', {
        method: 'POST',
        body: JSON.stringify({ url }),
      }),
  };

  songs = {
    get: (id: string) => this.request<Song>(`/songs/${id}`),
    create: (data: { title: string; artist: string; lyrics?: string }) =>
      this.request<Song>('/songs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getChords: (id: string, instrument: Instrument) => this.request<{ chords: string }>(`/songs/${id}/chords`, {
      method: 'POST',
      body: JSON.stringify({ instrument }),
    }),
    saveChords: (id: string, chords: string, instrument: Instrument) =>
      this.request<MessageResponse>(`/songs/${id}/chords`, {
        method: 'PUT',
        body: JSON.stringify({ chords, instrument }),
      }),
    setYoutube: (id: string, url: string | null) =>
      this.request<MessageResponse>(`/songs/${id}/youtube`, {
        method: 'PUT',
        body: JSON.stringify({ url: url ?? '' }),
      }),
    list: (limit?: number, offset?: number, q?: string) => this.request<Song[]>(`/songs?limit=${limit || 50}&offset=${offset || 0}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    getPopular: (limit?: number) => this.request<Song[]>(`/songs/popular?limit=${limit || 20}`),
    byChords: (chords: string[]) => this.request<{ chords: string[]; results: Song[] }>(`/songs/by-chords?chords=${encodeURIComponent(chords.join(','))}`),
    getComments: (id: string) => this.request<Comment[]>(`/comments/${id}`),
    addComment: (id: string, content: string) =>
      this.request<Comment>(`/comments/${id}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    deleteComment: (_songId: string, commentId: string) =>
      this.request<MessageResponse>(`/comments/${commentId}`, { method: 'DELETE' }),
  };

  favorites = {
    list: () => this.request<Song[]>('/favorites'),
    add: (songId: string) =>
      this.request<MessageResponse>(`/favorites/${songId}`, { method: 'POST' }),
    remove: (songId: string) =>
      this.request<MessageResponse>(`/favorites/${songId}`, { method: 'DELETE' }),
  };

  history = {
    list: (limit?: number) => this.request<Song[]>(`/history${limit ? `?limit=${limit}` : ''}`),
    add: (songId: string) =>
      this.request<MessageResponse>(`/history/${songId}`, { method: 'POST' }),
    clear: () => this.request<MessageResponse>('/history', { method: 'DELETE' }),
  };

  setlists = {
    list: () => this.request<Array<{ id: number; name: string; songCount: number; createdAt: string; updatedAt: string }>>('/setlists'),
    get: (id: number) => this.request<{ id: number; name: string; createdAt: string; updatedAt: string; shareToken: string | null; songs: (Song & { position: number })[] }>(`/setlists/${id}`),
    create: (name: string) => this.request<{ id: number; name: string; songCount: number }>('/setlists', { method: 'POST', body: JSON.stringify({ name }) }),
    rename: (id: number, name: string) => this.request<MessageResponse>(`/setlists/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    remove: (id: number) => this.request<MessageResponse>(`/setlists/${id}`, { method: 'DELETE' }),
    addSong: (id: number, songId: string) => this.request<MessageResponse>(`/setlists/${id}/songs`, { method: 'POST', body: JSON.stringify({ songId }) }),
    removeSong: (id: number, songId: string) => this.request<MessageResponse>(`/setlists/${id}/songs/${songId}`, { method: 'DELETE' }),
    reorder: (id: number, songIds: string[]) => this.request<MessageResponse>(`/setlists/${id}/order`, { method: 'PUT', body: JSON.stringify({ songIds }) }),
    share: (id: number) => this.request<{ token: string; expiresInDays?: number }>(`/setlists/${id}/share`, { method: 'POST' }),
    unshare: (id: number) => this.request<MessageResponse>(`/setlists/${id}/share`, { method: 'DELETE' }),
    getPublic: (token: string) => this.request<{ id: number; name: string; owner: string; songs: (Song & { position: number })[] }>(`/setlists/public/${token}`),
  };

  recommendations = {
    get: (limit?: number) => this.request<{ source: 'collaborative' | 'popular'; results: Song[] }>(`/recommendations${limit ? `?limit=${limit}` : ''}`),
  };

  progress = {
    me: () => this.request<{ learning: Song[]; learned: Song[] }>('/progress/me'),
    get: (songId: string) => this.request<{ status: 'learning' | 'learned' | null; updatedAt: string | null }>(`/progress/${songId}`),
    set: (songId: string, status: 'learning' | 'learned') => this.request<MessageResponse>(`/progress/${songId}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    clear: (songId: string) => this.request<MessageResponse>(`/progress/${songId}`, { method: 'DELETE' }),
  };

  practice = {
    log: (songId: string, durationSec: number) =>
      this.request<MessageResponse>('/practice', {
        method: 'POST',
        body: JSON.stringify({ songId, durationSec }),
      }),
    stats: () =>
      this.request<{
        totalSec: number;
        sessions: number;
        uniqueSongs: number;
        byDay: { day: string; sec: number }[];
        topSongs: (Song & { practicedSec: number; sessions: number })[];
      }>('/practice/stats'),
  };

  ratings = {
    get: (songId: string) => this.request<RatingSummary>(`/ratings/${songId}`),
    save: (songId: string, score: number) =>
      this.request<MessageResponse>(`/ratings/${songId}`, {
        method: 'POST',
        body: JSON.stringify({ score }),
      }),
  };
}

export const api = new ApiClient();
