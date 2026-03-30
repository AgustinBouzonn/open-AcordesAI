export interface User {
  id: string;
  username: string;
  email: string;
  provider?: string;
  providerApiKey?: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  lyrics?: string;
  chords?: string;
  source?: string;
  sourceUrl?: string;
  artworkUrl?: string;
  author?: string;
  rating?: string | number | null;
  rating_count?: string | number;
  has_chords?: string | number;
  user_id?: string | number;
  view_count?: string | number;
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
  id: string;
  title: string;
  artist: string;
  source: string;
  url?: string;
}
