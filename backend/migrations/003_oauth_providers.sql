ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider_id VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_auth_provider_pair
ON users(auth_provider, auth_provider_id)
WHERE auth_provider IS NOT NULL AND auth_provider_id IS NOT NULL;
