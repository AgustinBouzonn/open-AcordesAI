type SongRow = Record<string, unknown>;

export const serializeSong = (row: SongRow) => {
  // Optimize: eliminate Object.fromEntries and filter allocations
  const obj: Record<string, unknown> = {
    id: row.id,
    title: row.title,
    artist: row.artist
  };

  if (row.lyrics !== undefined && row.lyrics !== null) obj.lyrics = row.lyrics;
  if (row.chords !== undefined && row.chords !== null) obj.chords = row.chords;
  if (row.author !== undefined && row.author !== null) obj.author = row.author;

  const artworkUrl = row.artwork_url ?? row.artworkUrl;
  if (artworkUrl !== undefined && artworkUrl !== null) obj.artworkUrl = artworkUrl;

  if (row.rating !== undefined && row.rating !== null) obj.rating = row.rating;

  const ratingCount = row.rating_count ?? row.ratingCount;
  if (ratingCount !== undefined && ratingCount !== null) obj.ratingCount = ratingCount;

  const hasChords = row.has_chords ?? row.hasChords;
  if (hasChords !== undefined && hasChords !== null) obj.hasChords = hasChords;

  const favoritedAt = row.favorited_at ?? row.favoritedAt;
  if (favoritedAt !== undefined && favoritedAt !== null) obj.favoritedAt = favoritedAt;

  const viewedAt = row.viewed_at ?? row.viewedAt;
  if (viewedAt !== undefined && viewedAt !== null) obj.viewedAt = viewedAt;

  const createdAt = row.created_at ?? row.createdAt;
  if (createdAt !== undefined && createdAt !== null) obj.createdAt = createdAt;

  const updatedAt = row.updated_at ?? row.updatedAt;
  if (updatedAt !== undefined && updatedAt !== null) obj.updatedAt = updatedAt;

  const userId = row.user_id ?? row.userId;
  if (userId !== undefined && userId !== null) obj.userId = userId;

  const viewCount = row.view_count ?? row.viewCount;
  if (viewCount !== undefined && viewCount !== null) obj.viewCount = viewCount;

  return obj;
};
