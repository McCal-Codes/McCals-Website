import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Plugin to serve portfolio images from src/images during dev
const servePortfolioImages = () => ({
  name: 'serve-portfolio-images',
  configureServer(server: any) {
    server.middlewares.use('/src/images/Portfolios', (req: any, res: any, next: any) => {
      try {
        // Skip if URL has query parameters (Vite internal requests)
        if (req.url?.includes('?')) {
          return next();
        }
        
        // Decode URL-encoded path (e.g., %20 -> space)
        const decodedUrl = decodeURIComponent(req.url || '');
        // Build absolute path to the image - go up 2 levels to reach project root
        const baseDir = path.resolve(__dirname, '..', '..', 'src', 'images', 'Portfolios');
        const filePath = path.join(baseDir, decodedUrl);
        
        // Security: ensure path is within Portfolios directory
        if (!filePath.startsWith(baseDir)) {
          return next();
        }
        
        // Only handle image files
        const ext = path.extname(filePath).toLowerCase();
        if (!['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
          return next();
        }
        
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          const extClean = ext.slice(1);
          const mimeTypes: Record<string, string> = {
            jpg: 'image/jpeg', 
            jpeg: 'image/jpeg', 
            png: 'image/png', 
            webp: 'image/webp',
            gif: 'image/gif'
          };
          res.setHeader('Content-Type', mimeTypes[extClean] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(filePath).pipe(res);
        } else {
          next();
        }
      } catch (err) {
        next();
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), servePortfolioImages()],
  publicDir: resolve(__dirname, './public-vite'),
  esbuild: {
    // Don't try to transform HTML files as JavaScript
    include: [/\.tsx?$/, /\.jsx?$/],
    exclude: [/\.html$/],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
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
    // Allow serving files from parent directories
    fs: {
      allow: ['..'],
    },
  },
});
