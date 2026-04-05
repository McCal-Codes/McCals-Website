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
        // Decode URL-encoded path (e.g., %20 -> space)
        const decodedUrl = decodeURIComponent(req.url || '');
        // Build absolute path to the image - go up 2 levels to reach project root
        const baseDir = path.resolve(__dirname, '..', '..', 'src', 'images', 'Portfolios');
        const filePath = path.join(baseDir, decodedUrl);
        
        console.log('[VITE] __dirname:', __dirname);
        console.log('[VITE] baseDir:', baseDir);
        console.log('[VITE] decodedUrl:', decodedUrl);
        console.log('[VITE] filePath:', filePath);
        console.log('[VITE] exists:', fs.existsSync(filePath));
        
        // Security: ensure path is within Portfolios directory
        if (!filePath.startsWith(baseDir)) {
          console.log('[VITE] Security check failed');
          return next();
        }
        
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
          console.log('[VITE] Serving file:', filePath);
          const ext = path.extname(filePath).toLowerCase().slice(1);
          const mimeTypes: Record<string, string> = {
            jpg: 'image/jpeg', 
            jpeg: 'image/jpeg', 
            png: 'image/png', 
            webp: 'image/webp',
            gif: 'image/gif'
          };
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          fs.createReadStream(filePath).pipe(res);
        } else {
          console.log('[VITE] File not found, passing to next');
          next();
        }
      } catch (err) {
        console.log('[VITE] Error:', err);
        next();
      }
    });
  },
});

export default defineConfig({
  plugins: [react(), servePortfolioImages()],
  publicDir: resolve(__dirname, './public-vite'),
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
