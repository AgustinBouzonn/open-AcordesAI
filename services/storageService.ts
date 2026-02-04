import { Comment, Song, UserState, Instrument } from '../types';

const FAVORITES_KEY = 'acordesai_favorites';
const COMMENTS_KEY = 'acordesai_comments';
const CACHED_SONGS_KEY = 'acordesai_songs_cache';
const HISTORY_KEY = 'acordesai_history';

// Helper to simulate DB latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getFavorites = (): string[] => {
  const stored = localStorage.getItem(FAVORITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const toggleFavorite = (songId: string): boolean => {
  const favorites = getFavorites();
  const index = favorites.indexOf(songId);
  let newFavorites;
  let isFavorite = false;

  if (index >= 0) {
    newFavorites = favorites.filter(id => id !== songId);
  } else {
    newFavorites = [...favorites, songId];
    isFavorite = true;
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  return isFavorite;
};

export const isSongFavorite = (songId: string): boolean => {
  const favorites = getFavorites();
  return favorites.includes(songId);
};

export const getComments = (songId: string): Comment[] => {
  const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
  return allComments[songId] || [];
};

export const addComment = (songId: string, text: string): Comment => {
  const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
  const songComments = allComments[songId] || [];
  
  const newComment: Comment = {
    id: Date.now().toString(),
    songId,
    user: 'Usuario Anónimo', // In a real app, this would come from auth
    text,
    timestamp: Date.now(),
  };

  allComments[songId] = [newComment, ...songComments];
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  return newComment;
};

// Cache songs locally to avoid re-fetching from AI every time (Simulates a song DB)
export const cacheSong = (song: Song) => {
  const cache = JSON.parse(localStorage.getItem(CACHED_SONGS_KEY) || '{}');
  const existingSong = cache[song.id];

  if (existingSong) {
    // Merge existing chords with new ones
    cache[song.id] = {
      ...existingSong,
      ...song,
      chords: {
        ...(existingSong.chords || {}),
        ...(song.chords || {})
      }
    };
  } else {
    cache[song.id] = song;
  }
  
  localStorage.setItem(CACHED_SONGS_KEY, JSON.stringify(cache));
};

export const updateSongInstrument = (songId: string, instrument: Instrument, content: string): Song | null => {
    const cache = JSON.parse(localStorage.getItem(CACHED_SONGS_KEY) || '{}');
    const song = cache[songId];
    
    if (song) {
        if (!song.chords) song.chords = {};
        song.chords[instrument] = content;
        // Also update the main content to reflect this instrument is active
        song.content = content; 
        
        cache[songId] = song;
        localStorage.setItem(CACHED_SONGS_KEY, JSON.stringify(cache));
        return song;
    }
    return null;
};

export const getCachedSong = (songId: string): Song | null => {
  const cache = JSON.parse(localStorage.getItem(CACHED_SONGS_KEY) || '{}');
  return cache[songId] || null;
};

export const getFavoriteSongsFull = (): Song[] => {
  const favIds = getFavorites();
  const cache = JSON.parse(localStorage.getItem(CACHED_SONGS_KEY) || '{}');
  return favIds.map(id => cache[id]).filter(Boolean);
};

// History Functions

export const addToHistory = (songId: string) => {
  let history: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  
  // Remove existing instance of this song to move it to top
  history = history.filter(id => id !== songId);
  
  // Add to beginning
  history.unshift(songId);
  
  // Limit to 10
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export const getHistorySongsFull = (): Song[] => {
  const historyIds: string[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  const cache = JSON.parse(localStorage.getItem(CACHED_SONGS_KEY) || '{}');
  return historyIds.map(id => cache[id]).filter(Boolean);
};