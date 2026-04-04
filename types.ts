export interface User {
  id: string;
  username: string;
  email: string;
  provider?: string;
  providerApiKey?: string;
}

export type OAuthProvider = 'google' | 'github';

export type Instrument = 'guitar' | 'ukulele' | 'piano';

export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics?: string;
  chords?: string;
  artworkUrl?: string;
  author?: string;
  rating?: string | number;
  ratingCount?: number;
  hasChords?: number;
  userId?: string;
  viewCount?: number;
  source?: string;
  sourceUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  favoritedAt?: string;
  viewedAt?: string;
}

export interface Comment {
  id: string;
  songId: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export interface SearchResult {
  id?: string;
  title: string;
  artist: string;
  source: string;
  url?: string;
  artworkUrl?: string;
}

export interface RatingSummary {
  average: string | null;
  count: number;
}

export interface ProfileStats {
  songsCreated: number;
  favorites: number;
  views: number;
}
