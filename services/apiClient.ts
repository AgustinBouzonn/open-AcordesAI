import { Capacitor } from '@capacitor/core';

const isNativePlatform = Capacitor.isNativePlatform();
const API_BASE =
  (isNativePlatform ? import.meta.env.VITE_NATIVE_API_URL : undefined) ||
  import.meta.env.VITE_API_URL ||
  '/api';

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

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

    return response.json();
  }

  auth = {
    register: (username: string, email: string, password: string) =>
      this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      }),
    login: (email: string, password: string) =>
      this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => this.request('/auth/me'),
  };

  search = {
    songs: (query: string) => this.request(`/search?q=${encodeURIComponent(query)}`),
  };

  songs = {
    get: (id: string) => this.request(`/songs/${id}`),
    create: (data: { title: string; artist: string; lyrics: string }) =>
      this.request('/songs', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getChords: (id: string, instrument: string) =>
      this.request(`/songs/${id}/chords`, {
        method: 'POST',
        body: JSON.stringify({ instrument }),
      }),
    saveChords: (id: string, chords: string, instrument: string) =>
      this.request(`/songs/${id}/chords`, {
        method: 'PUT',
        body: JSON.stringify({ chords, instrument }),
      }),
    list: (limit?: number, offset?: number) => this.request(`/songs?limit=${limit || 50}&offset=${offset || 0}`),
    getPopular: (limit?: number) => this.request(`/songs/popular?limit=${limit || 20}`),
    getComments: (id: string) => this.request(`/comments/${id}`),
    addComment: (id: string, content: string) =>
      this.request(`/comments/${id}`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    deleteComment: (songId: string, commentId: string) =>
      this.request(`/comments/${commentId}`, { method: 'DELETE' }),
  };

  favorites = {
    list: () => this.request('/favorites'),
    add: (songId: string) =>
      this.request(`/favorites/${songId}`, { method: 'POST' }),
    remove: (songId: string) =>
      this.request(`/favorites/${songId}`, { method: 'DELETE' }),
  };

  history = {
    list: (limit?: number) => this.request(`/history${limit ? `?limit=${limit}` : ''}`),
    add: (songId: string) =>
      this.request(`/history/${songId}`, { method: 'POST' }),
    clear: () => this.request('/history', { method: 'DELETE' }),
  };

  ratings = {
    get: (songId: string) => this.request<{ average: string | null; count: number }>(`/ratings/${songId}`),
    save: (songId: string, score: number) =>
      this.request<{ message: string }>(`/ratings/${songId}`, {
        method: 'POST',
        body: JSON.stringify({ score }),
      }),
  };
}

export const api = new ApiClient();
