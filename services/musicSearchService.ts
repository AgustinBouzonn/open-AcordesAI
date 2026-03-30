import { SongSearchResult } from '../types';
import { sanitizeInput } from '../utils/security';

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quitar tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Busca canciones usando la iTunes Search API.
 * Gratis, sin API key, soporta CORS, devuelve datos reales con artwork.
 */
export const searchSongsiTunes = async (query: string): Promise<SongSearchResult[]> => {
  const cleanQuery = sanitizeInput(query, 150);
  if (!cleanQuery) return [];

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=10&lang=es_es`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`iTunes search failed: ${response.status}`);

  const data = await response.json();

  return (data.results ?? []).map((track: Record<string, unknown>) => ({
    // ID estable basado en trackId de iTunes — mismo resultado siempre para la misma canción
    id: `itunes-${track.trackId}`,
    title: track.trackName as string,
    artist: track.artistName as string,
    // Artwork en 300x300 (por defecto iTunes devuelve 100x100)
    artworkUrl: (track.artworkUrl100 as string | undefined)?.replace('100x100bb', '300x300bb'),
    // Slug para uso interno y fallback
    slug: toSlug(`${track.artistName}-${track.trackName}`),
  }));
};
