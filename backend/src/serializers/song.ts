type SongRow = Record<string, unknown>;

export const serializeSong = (row: SongRow) => {
  // ⚡ Bolt: Use manual object construction to avoid expensive Object.entries() and filter() allocations
  const res: Record<string, unknown> = {
    id: row.id,
    title: row.title,
    artist: row.artist,
  };

  if (row.lyrics != null) res.lyrics = row.lyrics;
  if (row.chords != null) res.chords = row.chords;
  if (row.author != null) res.author = row.author;

  const artworkUrl = row.artwork_url ?? row.artworkUrl;
  if (artworkUrl != null) res.artworkUrl = artworkUrl;

  if (row.rating != null) res.rating = row.rating;

  const ratingCount = row.rating_count ?? row.ratingCount;
  if (ratingCount != null) res.ratingCount = ratingCount;

  const hasChords = row.has_chords ?? row.hasChords;
  if (hasChords != null) res.hasChords = hasChords;

  const favoritedAt = row.favorited_at ?? row.favoritedAt;
  if (favoritedAt != null) res.favoritedAt = favoritedAt;

  const viewedAt = row.viewed_at ?? row.viewedAt;
  if (viewedAt != null) res.viewedAt = viewedAt;

  const createdAt = row.created_at ?? row.createdAt;
  if (createdAt != null) res.createdAt = createdAt;

  const updatedAt = row.updated_at ?? row.updatedAt;
  if (updatedAt != null) res.updatedAt = updatedAt;

  const userId = row.user_id ?? row.userId;
  if (userId != null) res.userId = userId;

  const viewCount = row.view_count ?? row.viewCount;
  if (viewCount != null) res.viewCount = viewCount;

  const youtubeUrl = row.youtube_url ?? row.youtubeUrl;
  if (youtubeUrl != null) res.youtubeUrl = youtubeUrl;

  return res;
};
