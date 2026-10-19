-- Revocación de sesiones: el JWT lleva `tv` y requireAuth lo compara con users.token_version.
-- Subirlo invalida todas las sesiones abiertas de ese usuario. Los tokens viejos sin `tv` valen como 0.
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;
