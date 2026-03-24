import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['__tests__/**/*.spec.{ts,tsx}'],
    setupFiles: ['__tests__/setup.ts'],
  },
});
