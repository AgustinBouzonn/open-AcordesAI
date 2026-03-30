CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_songs_title_trgm
ON songs
USING GIN (title gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_songs_artist_trgm
ON songs
USING GIN (artist gin_trgm_ops);
