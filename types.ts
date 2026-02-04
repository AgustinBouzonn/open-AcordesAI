export type Instrument = 'guitar' | 'ukulele' | 'piano';

export interface Song {
  id: string; // usually artist-title-slug
  title: string;
  artist: string;
  content: string; // Default content (usually guitar) or currently displayed
  chords?: Partial<Record<Instrument, string>>; // Cache for specific instruments
  key: string;
  source?: string;
}

export interface Comment {
  id: string;
  songId: string;
  user: string;
  text: string;
  timestamp: number;
}

export interface UserState {
  favorites: string[]; // List of song IDs
}

export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  SONG_DETAIL = 'SONG_DETAIL',
  FAVORITES = 'FAVORITES'
}

export interface SongSearchResult {
  title: string;
  artist: string;
  id: string;
}