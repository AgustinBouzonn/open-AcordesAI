ALTER TABLE setlists ADD COLUMN IF NOT EXISTS share_token VARCHAR(32) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_setlists_share_token ON setlists(share_token) WHERE share_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_song_progress (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  status VARCHAR(16) NOT NULL CHECK (status IN ('learning', 'learned')),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, song_id)
);
CREATE INDEX IF NOT EXISTS idx_user_song_progress_user ON user_song_progress(user_id, status, updated_at DESC);

ALTER TABLE songs ADD COLUMN IF NOT EXISTS youtube_url VARCHAR(500);
