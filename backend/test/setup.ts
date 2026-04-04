process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-with-at-least-32-chars';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
