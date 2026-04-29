CREATE TABLE IF NOT EXISTS setlists (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS setlist_songs (
  setlist_id INTEGER NOT NULL REFERENCES setlists(id) ON DELETE CASCADE,
  song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  PRIMARY KEY (setlist_id, song_id)
);

CREATE INDEX IF NOT EXISTS idx_setlists_user ON setlists(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_setlist_songs_position ON setlist_songs(setlist_id, position);
