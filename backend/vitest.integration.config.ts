import { defineConfig } from 'vitest/config';

// Tests contra un Postgres real (DATABASE_URL). En CI lo levanta el service de ci.yml.
export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    include: ['test/integration/**/*.test.ts'],
    fileParallelism: false,
    clearMocks: true,
    restoreMocks: true,
  },
});
