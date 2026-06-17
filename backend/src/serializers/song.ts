type SongRow = Record<string, unknown>;

export const serializeSong = (row: SongRow) => {
  // ⚡ Bolt: Use manual object construction and avoid Object.fromEntries(Object.entries(...).filter(...))
  // for performance optimization in serialization
  const result: Record<string, unknown> = {
    id: row.id,
    title: row.title,
    artist: row.artist,
  };

  if (row.lyrics != null) result.lyrics = row.lyrics;
  if (row.chords != null) result.chords = row.chords;
  if (row.author != null) result.author = row.author;

  const artwork = row.artwork_url ?? row.artworkUrl;
  if (artwork != null) result.artworkUrl = artwork;

  if (row.rating != null) result.rating = row.rating;

  const ratingCount = row.rating_count ?? row.ratingCount;
  if (ratingCount != null) result.ratingCount = ratingCount;

  const hasChords = row.has_chords ?? row.hasChords;
  if (hasChords != null) result.hasChords = hasChords;

  const favoritedAt = row.favorited_at ?? row.favoritedAt;
  if (favoritedAt != null) result.favoritedAt = favoritedAt;

  const viewedAt = row.viewed_at ?? row.viewedAt;
  if (viewedAt != null) result.viewedAt = viewedAt;

  const createdAt = row.created_at ?? row.createdAt;
  if (createdAt != null) result.createdAt = createdAt;

  const updatedAt = row.updated_at ?? row.updatedAt;
  if (updatedAt != null) result.updatedAt = updatedAt;

  const userId = row.user_id ?? row.userId;
  if (userId != null) result.userId = userId;

  const viewCount = row.view_count ?? row.viewCount;
  if (viewCount != null) result.viewCount = viewCount;

  const youtubeUrl = row.youtube_url ?? row.youtubeUrl;
  if (youtubeUrl != null) result.youtubeUrl = youtubeUrl;

  return result;
};
