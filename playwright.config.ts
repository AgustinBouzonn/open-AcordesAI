import { defineConfig, devices } from '@playwright/test';

// Smoke e2e contra la app real: backend compilado + build del frontend (vite preview) + Postgres.
// Requiere `npm run build:all` y DATABASE_URL con las migraciones aplicadas (en CI lo hace ci.yml).
const env = {
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/test',
  JWT_SECRET: process.env.JWT_SECRET || 'test-secret-with-at-least-32-chars',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4173',
  PORT: '3001',
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    // El service worker cachea /api/songs: en los tests se quiere siempre la respuesta real.
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'node backend/dist/index.js',
      url: 'http://localhost:3001/api/health',
      env,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npx vite preview --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
