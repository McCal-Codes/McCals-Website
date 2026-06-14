import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/scripts/**',
      ],
      // Baseline thresholds — intentionally low so they pass today without measuring.
      // Run `npm run test:coverage` to see real numbers, then ratchet these up.
      // (Not yet wired as a hard CI gate — see test:coverage script.)
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 40,
        statements: 20,
      },
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
