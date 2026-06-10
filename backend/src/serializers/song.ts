type SongRow = Record<string, unknown>;

// ⚡ Bolt: Use manual object construction instead of Object.fromEntries/entries
// to prevent unnecessary object allocation and array iterations in this hot loop.
export const serializeSong = (row: SongRow) => {
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

  const rc = row.rating_count ?? row.ratingCount;
  if (rc != null) result.ratingCount = rc;

  const hc = row.has_chords ?? row.hasChords;
  if (hc != null) result.hasChords = hc;

  const fa = row.favorited_at ?? row.favoritedAt;
  if (fa != null) result.favoritedAt = fa;

  const va = row.viewed_at ?? row.viewedAt;
  if (va != null) result.viewedAt = va;

  const ca = row.created_at ?? row.createdAt;
  if (ca != null) result.createdAt = ca;

  const ua = row.updated_at ?? row.updatedAt;
  if (ua != null) result.updatedAt = ua;

  const ui = row.user_id ?? row.userId;
  if (ui != null) result.userId = ui;

  const vc = row.view_count ?? row.viewCount;
  if (vc != null) result.viewCount = vc;

  const yu = row.youtube_url ?? row.youtubeUrl;
  if (yu != null) result.youtubeUrl = yu;

  return result;
};
