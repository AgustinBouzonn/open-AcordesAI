type SongRow = Record<string, unknown>;

// ⚡ Bolt: Use manual object construction instead of Object.fromEntries(Object.entries(...).filter(...))
// to avoid intermediate array allocations and improve serialization performance.
export const serializeSong = (row: SongRow) => {
  const result: Record<string, unknown> = {
    id: row.id,
    title: row.title,
    artist: row.artist,
  };
  if (row.lyrics != null) result.lyrics = row.lyrics;
  if (row.chords != null) result.chords = row.chords;
  if (row.author != null) result.author = row.author;
  if (row.artwork_url != null || row.artworkUrl != null) result.artworkUrl = row.artwork_url ?? row.artworkUrl;
  if (row.rating != null) result.rating = row.rating;
  if (row.rating_count != null || row.ratingCount != null) result.ratingCount = row.rating_count ?? row.ratingCount;
  if (row.has_chords != null || row.hasChords != null) result.hasChords = row.has_chords ?? row.hasChords;
  if (row.favorited_at != null || row.favoritedAt != null) result.favoritedAt = row.favorited_at ?? row.favoritedAt;
  if (row.viewed_at != null || row.viewedAt != null) result.viewedAt = row.viewed_at ?? row.viewedAt;
  if (row.created_at != null || row.createdAt != null) result.createdAt = row.created_at ?? row.createdAt;
  if (row.updated_at != null || row.updatedAt != null) result.updatedAt = row.updated_at ?? row.updatedAt;
  if (row.user_id != null || row.userId != null) result.userId = row.user_id ?? row.userId;
  if (row.view_count != null || row.viewCount != null) result.viewCount = row.view_count ?? row.viewCount;
  if (row.youtube_url != null || row.youtubeUrl != null) result.youtubeUrl = row.youtube_url ?? row.youtubeUrl;
  return result;
};
