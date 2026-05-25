type SongRow = Record<string, unknown>;

// Performance optimization: Avoid Object.fromEntries and Object.entries overhead
export const serializeSong = (row: SongRow) => {
  const result: Record<string, unknown> = {};

  if (row.id !== undefined) result.id = row.id;
  if (row.title !== undefined) result.title = row.title;
  if (row.artist !== undefined) result.artist = row.artist;

  let val: unknown;

  val = row.lyrics ?? undefined;
  if (val !== undefined) result.lyrics = val;

  val = row.chords ?? undefined;
  if (val !== undefined) result.chords = val;

  val = row.author ?? undefined;
  if (val !== undefined) result.author = val;

  val = row.artwork_url ?? row.artworkUrl ?? undefined;
  if (val !== undefined) result.artworkUrl = val;

  val = row.rating ?? undefined;
  if (val !== undefined) result.rating = val;

  val = row.rating_count ?? row.ratingCount ?? undefined;
  if (val !== undefined) result.ratingCount = val;

  val = row.has_chords ?? row.hasChords ?? undefined;
  if (val !== undefined) result.hasChords = val;

  val = row.favorited_at ?? row.favoritedAt ?? undefined;
  if (val !== undefined) result.favoritedAt = val;

  val = row.viewed_at ?? row.viewedAt ?? undefined;
  if (val !== undefined) result.viewedAt = val;

  val = row.created_at ?? row.createdAt ?? undefined;
  if (val !== undefined) result.createdAt = val;

  val = row.updated_at ?? row.updatedAt ?? undefined;
  if (val !== undefined) result.updatedAt = val;

  val = row.user_id ?? row.userId ?? undefined;
  if (val !== undefined) result.userId = val;

  val = row.view_count ?? row.viewCount ?? undefined;
  if (val !== undefined) result.viewCount = val;

  val = row.youtube_url ?? row.youtubeUrl ?? undefined;
  if (val !== undefined) result.youtubeUrl = val;

  return result;
};
