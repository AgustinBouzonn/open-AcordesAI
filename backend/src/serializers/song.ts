type SongRow = Record<string, unknown>;

export const serializeSong = (row: SongRow) => {
  // ⚡ Bolt: Replaced Object.entries().filter().fromEntries() with manual object
  // construction and conditional assignment to eliminate significant allocation
  // overhead of intermediate arrays/objects in performance-critical serialization path.
  const obj: Record<string, unknown> = {};

  if (row.id !== undefined) obj.id = row.id;
  if (row.title !== undefined) obj.title = row.title;
  if (row.artist !== undefined) obj.artist = row.artist;

  const lyrics = row.lyrics ?? undefined;
  if (lyrics !== undefined) obj.lyrics = lyrics;

  const chords = row.chords ?? undefined;
  if (chords !== undefined) obj.chords = chords;

  const author = row.author ?? undefined;
  if (author !== undefined) obj.author = author;

  const artworkUrl = row.artwork_url ?? row.artworkUrl ?? undefined;
  if (artworkUrl !== undefined) obj.artworkUrl = artworkUrl;

  const rating = row.rating ?? undefined;
  if (rating !== undefined) obj.rating = rating;

  const ratingCount = row.rating_count ?? row.ratingCount ?? undefined;
  if (ratingCount !== undefined) obj.ratingCount = ratingCount;

  const hasChords = row.has_chords ?? row.hasChords ?? undefined;
  if (hasChords !== undefined) obj.hasChords = hasChords;

  const favoritedAt = row.favorited_at ?? row.favoritedAt ?? undefined;
  if (favoritedAt !== undefined) obj.favoritedAt = favoritedAt;

  const viewedAt = row.viewed_at ?? row.viewedAt ?? undefined;
  if (viewedAt !== undefined) obj.viewedAt = viewedAt;

  const createdAt = row.created_at ?? row.createdAt ?? undefined;
  if (createdAt !== undefined) obj.createdAt = createdAt;

  const updatedAt = row.updated_at ?? row.updatedAt ?? undefined;
  if (updatedAt !== undefined) obj.updatedAt = updatedAt;

  const userId = row.user_id ?? row.userId ?? undefined;
  if (userId !== undefined) obj.userId = userId;

  const viewCount = row.view_count ?? row.viewCount ?? undefined;
  if (viewCount !== undefined) obj.viewCount = viewCount;

  return obj;
};
