import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    // Los de integración necesitan Postgres: `npm run test:integration`.
    exclude: ['test/integration/**', 'node_modules/**', 'dist/**'],
    clearMocks: true,
    restoreMocks: true,
  },
});
