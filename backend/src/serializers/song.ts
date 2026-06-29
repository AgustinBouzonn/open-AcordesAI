type SongRow = Record<string, unknown>;

// ⚡ Bolt: Use manual object construction to avoid Object.entries/filter/fromEntries allocations
export const serializeSong = (row: SongRow) => {
  const result: Record<string, unknown> = {
    id: row.id,
    title: row.title,
    artist: row.artist,
  };

  if (row.lyrics != null) result.lyrics = row.lyrics;
  if (row.chords != null) result.chords = row.chords;
  if (row.author != null) result.author = row.author;

  if (row.artwork_url != null) result.artworkUrl = row.artwork_url;
  else if (row.artworkUrl != null) result.artworkUrl = row.artworkUrl;

  if (row.rating != null) result.rating = row.rating;

  if (row.rating_count != null) result.ratingCount = row.rating_count;
  else if (row.ratingCount != null) result.ratingCount = row.ratingCount;

  if (row.has_chords != null) result.hasChords = row.has_chords;
  else if (row.hasChords != null) result.hasChords = row.hasChords;

  if (row.favorited_at != null) result.favoritedAt = row.favorited_at;
  else if (row.favoritedAt != null) result.favoritedAt = row.favoritedAt;

  if (row.viewed_at != null) result.viewedAt = row.viewed_at;
  else if (row.viewedAt != null) result.viewedAt = row.viewedAt;

  if (row.created_at != null) result.createdAt = row.created_at;
  else if (row.createdAt != null) result.createdAt = row.createdAt;

  if (row.updated_at != null) result.updatedAt = row.updated_at;
  else if (row.updatedAt != null) result.updatedAt = row.updatedAt;

  if (row.user_id != null) result.userId = row.user_id;
  else if (row.userId != null) result.userId = row.userId;

  if (row.view_count != null) result.viewCount = row.view_count;
  else if (row.viewCount != null) result.viewCount = row.viewCount;

  if (row.youtube_url != null) result.youtubeUrl = row.youtube_url;
  else if (row.youtubeUrl != null) result.youtubeUrl = row.youtubeUrl;

  return result;
};
