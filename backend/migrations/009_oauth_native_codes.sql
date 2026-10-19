-- Login social desde la app nativa: el callback de OAuth no puede mandar el JWT en la URL del deep link
-- (otra app podría registrar el mismo esquema y leerlo). Manda un código de un solo uso y vida corta,
-- y la app lo canjea por la sesión con POST /api/auth/oauth/native/exchange. Se guarda solo el hash.
CREATE TABLE IF NOT EXISTS oauth_native_codes (
  code_hash TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_native_codes_expires_at ON oauth_native_codes (expires_at);
