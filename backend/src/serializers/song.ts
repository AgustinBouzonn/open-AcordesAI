type SongRow = Record<string, unknown>;

// Optimization: Avoids intermediate Object.entries/filter/fromEntries allocations
export const serializeSong = (row: SongRow) => {
  const result: Record<string, unknown> = {};

  if (row.id !== undefined) result.id = row.id;
  if (row.title !== undefined) result.title = row.title;
  if (row.artist !== undefined) result.artist = row.artist;

  const lyrics = row.lyrics ?? undefined;
  if (lyrics !== undefined) result.lyrics = lyrics;

  const chords = row.chords ?? undefined;
  if (chords !== undefined) result.chords = chords;

  const author = row.author ?? undefined;
  if (author !== undefined) result.author = author;

  const artworkUrl = row.artwork_url ?? row.artworkUrl ?? undefined;
  if (artworkUrl !== undefined) result.artworkUrl = artworkUrl;

  const rating = row.rating ?? undefined;
  if (rating !== undefined) result.rating = rating;

  const ratingCount = row.rating_count ?? row.ratingCount ?? undefined;
  if (ratingCount !== undefined) result.ratingCount = ratingCount;

  const hasChords = row.has_chords ?? row.hasChords ?? undefined;
  if (hasChords !== undefined) result.hasChords = hasChords;

  const favoritedAt = row.favorited_at ?? row.favoritedAt ?? undefined;
  if (favoritedAt !== undefined) result.favoritedAt = favoritedAt;

  const viewedAt = row.viewed_at ?? row.viewedAt ?? undefined;
  if (viewedAt !== undefined) result.viewedAt = viewedAt;

  const createdAt = row.created_at ?? row.createdAt ?? undefined;
  if (createdAt !== undefined) result.createdAt = createdAt;

  const updatedAt = row.updated_at ?? row.updatedAt ?? undefined;
  if (updatedAt !== undefined) result.updatedAt = updatedAt;

  const userId = row.user_id ?? row.userId ?? undefined;
  if (userId !== undefined) result.userId = userId;

  const viewCount = row.view_count ?? row.viewCount ?? undefined;
  if (viewCount !== undefined) result.viewCount = viewCount;

  return result;
};
