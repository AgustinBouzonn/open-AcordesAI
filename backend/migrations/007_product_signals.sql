-- Señales de producto para el loop de mejora (ver scripts/signals-report.sh).
-- Sin user_id a propósito: solo se guardan datos agregables.
CREATE TABLE IF NOT EXISTS product_events (
  id BIGSERIAL PRIMARY KEY,
  kind VARCHAR(40) NOT NULL,
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_events_kind_created ON product_events (kind, created_at DESC);

-- De dónde salió cada cifrado: 'ai', 'import' o 'user'. NULL = anterior a esta migración.
ALTER TABLE chord_cache ADD COLUMN IF NOT EXISTS origin VARCHAR(16);
ALTER TABLE chord_cache ADD COLUMN IF NOT EXISTS model VARCHAR(80);
