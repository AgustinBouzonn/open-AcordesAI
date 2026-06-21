type SongRow = Record<string, unknown>;

// ⚡ Bolt: Use manual object construction instead of Object.fromEntries(Object.entries(...).filter(...)) to avoid intermediate arrays and iterations overhead
export const serializeSong = (row: SongRow) => {
  const obj: Record<string, unknown> = {
    id: row.id,
    title: row.title,
    artist: row.artist,
  };

  if (row.lyrics != null) obj.lyrics = row.lyrics;
  if (row.chords != null) obj.chords = row.chords;
  if (row.author != null) obj.author = row.author;

  const artwork = row.artwork_url ?? row.artworkUrl;
  if (artwork != null) obj.artworkUrl = artwork;

  if (row.rating != null) obj.rating = row.rating;

  const rc = row.rating_count ?? row.ratingCount;
  if (rc != null) obj.ratingCount = rc;

  const hc = row.has_chords ?? row.hasChords;
  if (hc != null) obj.hasChords = hc;

  const fa = row.favorited_at ?? row.favoritedAt;
  if (fa != null) obj.favoritedAt = fa;

  const va = row.viewed_at ?? row.viewedAt;
  if (va != null) obj.viewedAt = va;

  const ca = row.created_at ?? row.createdAt;
  if (ca != null) obj.createdAt = ca;

  const ua = row.updated_at ?? row.updatedAt;
  if (ua != null) obj.updatedAt = ua;

  const uid = row.user_id ?? row.userId;
  if (uid != null) obj.userId = uid;

  const vc = row.view_count ?? row.viewCount;
  if (vc != null) obj.viewCount = vc;

  const yu = row.youtube_url ?? row.youtubeUrl;
  if (yu != null) obj.youtubeUrl = yu;

  return obj;
};
