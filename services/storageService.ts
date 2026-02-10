import { Comment, Song, Instrument } from '../types';

const FAVORITES_KEY = 'acordesai_favorites';
const COMMENTS_KEY = 'acordesai_comments';
const CACHED_SONGS_KEY = 'acordesai_songs_cache';
const HISTORY_KEY = 'acordesai_history';

// In-memory cache to avoid repeated JSON parsing
const memoryCache: {
  songs: Record<string, Song> | null;
  favorites: string[] | null;
  history: string[] | null;
  comments: Record<string, Comment[]> | null;
} = {
  songs: null,
  favorites: null,
  history: null,
  comments: null
};

// Listen for storage events to invalidate cache if changed in another tab
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === CACHED_SONGS_KEY) memoryCache.songs = null;
    if (event.key === FAVORITES_KEY) memoryCache.favorites = null;
    if (event.key === HISTORY_KEY) memoryCache.history = null;
    if (event.key === COMMENTS_KEY) memoryCache.comments = null;
  });
}

// Helper to safely parse JSON
const safeJSONParse = <T>(jsonString: string | null, fallback: T): T => {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse storage item", e);
    return fallback;
  }
};

// Helper to get cache with lazy loading
const getSongsCache = (): Record<string, Song> => {
  if (!memoryCache.songs) {
    const stored = localStorage.getItem(CACHED_SONGS_KEY);
    memoryCache.songs = safeJSONParse(stored, {});
  }
  return memoryCache.songs!;
};

const getFavoritesCache = (): string[] => {
  if (!memoryCache.favorites) {
    const stored = localStorage.getItem(FAVORITES_KEY);
    memoryCache.favorites = safeJSONParse(stored, []);
  }
  return memoryCache.favorites!;
};

const getHistoryCache = (): string[] => {
  if (!memoryCache.history) {
    const stored = localStorage.getItem(HISTORY_KEY);
    memoryCache.history = safeJSONParse(stored, []);
  }
  return memoryCache.history!;
};

const getCommentsCache = (): Record<string, Comment[]> => {
  if (!memoryCache.comments) {
    const stored = localStorage.getItem(COMMENTS_KEY);
    memoryCache.comments = safeJSONParse(stored, {});
  }
  return memoryCache.comments!;
};

// Helper to update cache and storage
const updateSongsCache = (newCache: Record<string, Song>) => {
  memoryCache.songs = newCache;
  localStorage.setItem(CACHED_SONGS_KEY, JSON.stringify(newCache));
};

const updateFavoritesCache = (newFavorites: string[]) => {
  memoryCache.favorites = newFavorites;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
};

const updateHistoryCache = (newHistory: string[]) => {
  memoryCache.history = newHistory;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
};

const updateCommentsCache = (newComments: Record<string, Comment[]>) => {
  memoryCache.comments = newComments;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(newComments));
};

export const getFavorites = (): string[] => {
  return getFavoritesCache();
};

export const toggleFavorite = (songId: string): boolean => {
  const favorites = getFavoritesCache();
  const index = favorites.indexOf(songId);
  let newFavorites;
  let isFavorite = false;

  if (index >= 0) {
    newFavorites = favorites.filter(id => id !== songId);
  } else {
    newFavorites = [...favorites, songId];
    isFavorite = true;
  }

  updateFavoritesCache(newFavorites);
  return isFavorite;
};

export const isSongFavorite = (songId: string): boolean => {
  const favorites = getFavoritesCache();
  return favorites.includes(songId);
};

export const getComments = (songId: string): Comment[] => {
  const allComments = getCommentsCache();
  return allComments[songId] || [];
};

export const addComment = (songId: string, text: string): Comment => {
  const allComments = getCommentsCache();
  const songComments = allComments[songId] || [];
  
  const newComment: Comment = {
    id: Date.now().toString(),
    songId,
    user: 'Usuario Anónimo', // In a real app, this would come from auth
    text,
    timestamp: Date.now(),
  };

  const newAllComments = { ...allComments, [songId]: [newComment, ...songComments] };
  updateCommentsCache(newAllComments);
  return newComment;
};

// Cache songs locally to avoid re-fetching from AI every time (Simulates a song DB)
export const cacheSong = (song: Song) => {
  const cache = getSongsCache();
  const existingSong = cache[song.id];

  const newCache = { ...cache };

  if (existingSong) {
    // Merge existing chords with new ones
    newCache[song.id] = {
      ...existingSong,
      ...song,
      chords: {
        ...(existingSong.chords || {}),
        ...(song.chords || {})
      }
    };
  } else {
    newCache[song.id] = song;
  }
  
  updateSongsCache(newCache);
};

export const updateSongInstrument = (songId: string, instrument: Instrument, content: string): Song | null => {
    const cache = getSongsCache();
    const song = cache[songId];
    
    if (song) {
        // Create a deep copy to modify safely
        const updatedSong = { ...song, chords: { ...(song.chords || {}) } };

        updatedSong.chords[instrument] = content;
        // Also update the main content to reflect this instrument is active
        updatedSong.content = content;
        
        const newCache = { ...cache, [songId]: updatedSong };
        updateSongsCache(newCache);
        return updatedSong;
    }
    return null;
};

export const getCachedSong = (songId: string): Song | null => {
  const cache = getSongsCache();
  return cache[songId] || null;
};

export const getFavoriteSongsFull = (): Song[] => {
  const favIds = getFavoritesCache();
  const cache = getSongsCache();
  return favIds.map(id => cache[id]).filter(Boolean);
};

// History Functions

export const addToHistory = (songId: string) => {
  let history = getHistoryCache();
  
  // Remove existing instance of this song to move it to top
  const newHistory = history.filter(id => id !== songId);
  
  // Add to beginning
  newHistory.unshift(songId);
  
  // Limit to 10
  // Retain only first 10
  const finalHistory = newHistory.slice(0, 10);
  
  updateHistoryCache(finalHistory);
};

export const getHistorySongsFull = (): Song[] => {
  const historyIds = getHistoryCache();
  const cache = getSongsCache();
  return historyIds.map(id => cache[id]).filter(Boolean);
};
