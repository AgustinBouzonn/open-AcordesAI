import { Comment, Instrument, ProfileStats, RatingSummary, Song, User } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

interface MessageResponse {
  message: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed', error: 'Request failed' }));
      throw new Error(error.message || error.error || 'Request failed');
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
    updateProvider: (provider: string, apiKey: string) =>
      this.request<MessageResponse>('/auth/provider', {
        method: 'POST',
        body: JSON.stringify({ provider, apiKey }),
      }),
  };

  search = {
    songs: (query: string) => this.request<SearchSongsResponse>(`/search?q=${encodeURIComponent(query)}`),
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
    list: (limit?: number, offset?: number, q?: string) => this.request<Song[]>(`/songs?limit=${limit || 50}&offset=${offset || 0}${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    getPopular: (limit?: number) => this.request<Song[]>(`/songs/popular?limit=${limit || 20}`),
    getComments: (id: string) => this.request<Comment[]>(`/comments/${id}`),
    addComment: (id: string, content: string) =>
      this.request<Comment>(`/comments/${id}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    deleteComment: (songId: string, commentId: string) =>
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
