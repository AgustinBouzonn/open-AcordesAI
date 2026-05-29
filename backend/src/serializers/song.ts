type SongRow = Record<string, unknown>;

export const serializeSong = (row: SongRow) => {
  // Performance optimization: Using manual object construction and conditional assignments
  // avoids the significant allocation overhead of Object.fromEntries(Object.entries({...}).filter(...))
  const obj: Record<string, unknown> = {};

  if (row.id !== undefined) obj.id = row.id;
  if (row.title !== undefined) obj.title = row.title;
  if (row.artist !== undefined) obj.artist = row.artist;
  if (row.lyrics != null) obj.lyrics = row.lyrics;
  if (row.chords != null) obj.chords = row.chords;
  if (row.author != null) obj.author = row.author;

  const artworkUrl = row.artwork_url ?? row.artworkUrl;
  if (artworkUrl != null) obj.artworkUrl = artworkUrl;

  if (row.rating != null) obj.rating = row.rating;

  const ratingCount = row.rating_count ?? row.ratingCount;
  if (ratingCount != null) obj.ratingCount = ratingCount;

  const hasChords = row.has_chords ?? row.hasChords;
  if (hasChords != null) obj.hasChords = hasChords;

  const favoritedAt = row.favorited_at ?? row.favoritedAt;
  if (favoritedAt != null) obj.favoritedAt = favoritedAt;

  const viewedAt = row.viewed_at ?? row.viewedAt;
  if (viewedAt != null) obj.viewedAt = viewedAt;

  const createdAt = row.created_at ?? row.createdAt;
  if (createdAt != null) obj.createdAt = createdAt;

  const updatedAt = row.updated_at ?? row.updatedAt;
  if (updatedAt != null) obj.updatedAt = updatedAt;

  const userId = row.user_id ?? row.userId;
  if (userId != null) obj.userId = userId;

  const viewCount = row.view_count ?? row.viewCount;
  if (viewCount != null) obj.viewCount = viewCount;

  const youtubeUrl = row.youtube_url ?? row.youtubeUrl;
  if (youtubeUrl != null) obj.youtubeUrl = youtubeUrl;

  return obj;
};
