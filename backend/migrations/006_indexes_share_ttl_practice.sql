-- Índices para queries frecuentes que faltaban
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_song_id ON ratings(song_id);
CREATE INDEX IF NOT EXISTS idx_favorites_song_id ON favorites(song_id);
CREATE INDEX IF NOT EXISTS idx_history_song_id ON history(song_id);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_song ON setlist_songs(song_id);
CREATE INDEX IF NOT EXISTS idx_songs_source_url ON songs(source_url) WHERE source_url IS NOT NULL;

-- TTL para share tokens
ALTER TABLE setlists ADD COLUMN IF NOT EXISTS share_token_expires_at TIMESTAMPTZ;

-- Stats de práctica
CREATE TABLE IF NOT EXISTS practice_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  duration_sec INTEGER NOT NULL CHECK (duration_sec >= 0 AND duration_sec <= 86400),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_practice_user_started ON practice_sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_practice_song ON practice_sessions(song_id);
