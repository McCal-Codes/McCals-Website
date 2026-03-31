import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  publicDir: resolve(__dirname, './public-vite'),
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    // Expose Vercel's VERCEL_ENV system variable to the client bundle.
    // Falls back to the VITE_VERCEL_ENV value from .env files.
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(
      process.env.VERCEL_ENV ?? process.env.VITE_VERCEL_ENV ?? 'development'
    ),
  },
  server: {
    proxy: {
      '/dev-rss-proxy': {
        target: 'https://media.rss.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-rss-proxy/, ''),
      },
    },
  },
});
