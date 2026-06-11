type SongRow = Record<string, unknown>;

// ⚡ Bolt: Use manual object construction instead of Object.fromEntries(Object.entries(...).filter(...))
// This avoids intermediate array allocations, improving performance especially for large lists of songs (e.g. GET /songs).
export const serializeSong = (row: SongRow) => {
  const obj: Record<string, unknown> = {};

  if (row.id !== undefined) obj.id = row.id;
  if (row.title !== undefined) obj.title = row.title;
  if (row.artist !== undefined) obj.artist = row.artist;

  if (row.lyrics != null) obj.lyrics = row.lyrics;
  if (row.chords != null) obj.chords = row.chords;
  if (row.author != null) obj.author = row.author;

  if (row.artwork_url != null) obj.artworkUrl = row.artwork_url;
  else if (row.artworkUrl != null) obj.artworkUrl = row.artworkUrl;

  if (row.rating != null) obj.rating = row.rating;

  if (row.rating_count != null) obj.ratingCount = row.rating_count;
  else if (row.ratingCount != null) obj.ratingCount = row.ratingCount;

  if (row.has_chords != null) obj.hasChords = row.has_chords;
  else if (row.hasChords != null) obj.hasChords = row.hasChords;

  if (row.favorited_at != null) obj.favoritedAt = row.favorited_at;
  else if (row.favoritedAt != null) obj.favoritedAt = row.favoritedAt;

  if (row.viewed_at != null) obj.viewedAt = row.viewed_at;
  else if (row.viewedAt != null) obj.viewedAt = row.viewedAt;

  if (row.created_at != null) obj.createdAt = row.created_at;
  else if (row.createdAt != null) obj.createdAt = row.createdAt;

  if (row.updated_at != null) obj.updatedAt = row.updated_at;
  else if (row.updatedAt != null) obj.updatedAt = row.updatedAt;

  if (row.user_id != null) obj.userId = row.user_id;
  else if (row.userId != null) obj.userId = row.userId;

  if (row.view_count != null) obj.viewCount = row.view_count;
  else if (row.viewCount != null) obj.viewCount = row.viewCount;

  if (row.youtube_url != null) obj.youtubeUrl = row.youtube_url;
  else if (row.youtubeUrl != null) obj.youtubeUrl = row.youtubeUrl;

  return obj;
};
