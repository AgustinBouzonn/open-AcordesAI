import { api } from './apiClient';
import { Song, Comment } from '../types';

export const getFavorites = async (): Promise<Song[]> => {
  try {
    return await api.favorites.list();
  } catch {
    return [];
  }
};

export const toggleFavorite = async (songId: string): Promise<boolean> => {
  try {
    await api.favorites.add(songId);
    return true;
  } catch {
    try {
      await api.favorites.remove(songId);
      return false;
    } catch {
      return false;
    }
  }
};

export const isSongFavorite = async (songId: string, favorites: Song[]): Promise<boolean> => {
  return favorites.some(f => f.id === songId);
};

export const getComments = async (songId: string): Promise<Comment[]> => {
  try {
    return await api.songs.getComments(songId);
  } catch {
    return [];
  }
};

export const addComment = async (songId: string, content: string): Promise<Comment> => {
  return await api.songs.addComment(songId, content);
};

export const deleteComment = async (songId: string, commentId: string): Promise<void> => {
  await api.songs.deleteComment(songId, commentId);
};

export const getSong = async (id: string): Promise<Song> => {
  return await api.songs.get(id);
};

export const getChords = async (id: string, instrument: string): Promise<{ chords: string }> => {
  return await api.songs.getChords(id, instrument);
};

export const saveChords = async (id: string, chords: string, instrument: string): Promise<void> => {
  await api.songs.saveChords(id, chords, instrument);
};

export const searchSongs = async (query: string): Promise<Song[]> => {
  const response = await api.search.songs(query) as { results: Song[] };
  return response.results || [];
};

export const createSong = async (data: { title: string; artist: string; lyrics: string }): Promise<Song> => {
  return await api.songs.create(data);
};

export const getHistory = async (limit?: number): Promise<Song[]> => {
  try {
    return await api.history.list(limit);
  } catch {
    return [];
  }
};

export const addToHistory = async (songId: string): Promise<void> => {
  try {
    await api.history.add(songId);
  } catch {}
};

export const clearHistory = async (): Promise<void> => {
  await api.history.clear();
};

export const getCommunitySongs = async (limit?: number, offset?: number): Promise<Song[]> => {
  return await api.songs.list(limit, offset);
};

export const getPopularSongs = async (limit?: number): Promise<Song[]> => {
  return await api.songs.getPopular(limit);
};

export const searchLocalSongs = async (query: string): Promise<Song[]> => {
  try {
    const songs = await api.songs.list(100, 0);
    const q = query.toLowerCase();
    return songs.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.artist.toLowerCase().includes(q)
    );
  } catch {
    return [];
  }
};
