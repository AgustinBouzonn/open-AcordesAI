type SongRow = Record<string, unknown>;

// ⚡ Bolt: Removed Object.fromEntries(Object.entries(...)) to eliminate intermediate object/array allocation overhead
export const serializeSong = (row: SongRow) => {
  const result: Record<string, unknown> = {};

  if (row.id !== undefined) result.id = row.id;
  if (row.title !== undefined) result.title = row.title;
  if (row.artist !== undefined) result.artist = row.artist;

  if (row.lyrics !== undefined && row.lyrics !== null) result.lyrics = row.lyrics;
  if (row.chords !== undefined && row.chords !== null) result.chords = row.chords;
  if (row.author !== undefined && row.author !== null) result.author = row.author;

  const artworkUrl = row.artwork_url ?? row.artworkUrl;
  if (artworkUrl !== undefined && artworkUrl !== null) result.artworkUrl = artworkUrl;

  if (row.rating !== undefined && row.rating !== null) result.rating = row.rating;

  const ratingCount = row.rating_count ?? row.ratingCount;
  if (ratingCount !== undefined && ratingCount !== null) result.ratingCount = ratingCount;

  const hasChords = row.has_chords ?? row.hasChords;
  if (hasChords !== undefined && hasChords !== null) result.hasChords = hasChords;

  const favoritedAt = row.favorited_at ?? row.favoritedAt;
  if (favoritedAt !== undefined && favoritedAt !== null) result.favoritedAt = favoritedAt;

  const viewedAt = row.viewed_at ?? row.viewedAt;
  if (viewedAt !== undefined && viewedAt !== null) result.viewedAt = viewedAt;

  const createdAt = row.created_at ?? row.createdAt;
  if (createdAt !== undefined && createdAt !== null) result.createdAt = createdAt;

  const updatedAt = row.updated_at ?? row.updatedAt;
  if (updatedAt !== undefined && updatedAt !== null) result.updatedAt = updatedAt;

  const userId = row.user_id ?? row.userId;
  if (userId !== undefined && userId !== null) result.userId = userId;

  const viewCount = row.view_count ?? row.viewCount;
  if (viewCount !== undefined && viewCount !== null) result.viewCount = viewCount;

  return result;
};
