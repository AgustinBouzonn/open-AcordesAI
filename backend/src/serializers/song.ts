type SongRow = Record<string, unknown>;

export const serializeSong = (row: SongRow) => Object.fromEntries(
  Object.entries({
    id: row.id,
    title: row.title,
    artist: row.artist,
    lyrics: row.lyrics ?? undefined,
    chords: row.chords ?? undefined,
    author: row.author ?? undefined,
    artworkUrl: row.artwork_url ?? row.artworkUrl ?? undefined,
    rating: row.rating ?? undefined,
    ratingCount: row.rating_count ?? row.ratingCount ?? undefined,
    hasChords: row.has_chords ?? row.hasChords ?? undefined,
    favoritedAt: row.favorited_at ?? row.favoritedAt ?? undefined,
    viewedAt: row.viewed_at ?? row.viewedAt ?? undefined,
    createdAt: row.created_at ?? row.createdAt ?? undefined,
    updatedAt: row.updated_at ?? row.updatedAt ?? undefined,
    userId: row.user_id ?? row.userId ?? undefined,
    viewCount: row.view_count ?? row.viewCount ?? undefined,
  }).filter(([, value]) => value !== undefined)
);
