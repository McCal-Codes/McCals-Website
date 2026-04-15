import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { visualizer } from 'rollup-plugin-visualizer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_DIR = resolve(__dirname, './public-vite');
const SKIP_DIR_NAME = 'letting-me-go';

/**
 * Production build only: copy `public-vite` into `dist` but never enter a folder named `letting-me-go`
 * (can be stuck with EPERM on some Windows / exFAT drives). Dev keeps normal `publicDir` behavior.
 */
function copyPublicSkipDeadFolder(): Plugin {
  let outDirAbs = '';

  const walk = (fromRoot: string, toRoot: string, rel: string) => {
    const dir = rel ? path.join(fromRoot, rel) : fromRoot;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      console.warn(`[vite] public copy: skip unreadable ${dir}`, e);
      return;
    }
    for (const ent of entries) {
      if (ent.name === SKIP_DIR_NAME) {
        console.warn(`[vite] public copy: skipping locked folder ${path.join(dir, ent.name)}`);
        continue;
      }
      const relNext = rel ? path.join(rel, ent.name) : ent.name;
      const srcPath = path.join(fromRoot, relNext);
      const destPath = path.join(toRoot, relNext);
      if (ent.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        walk(fromRoot, toRoot, relNext);
      } else {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  return {
    name: 'copy-public-skip-letting-me-go',
    apply: 'build',
    configResolved(config) {
      outDirAbs = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      walk(PUBLIC_DIR, outDirAbs, '');
    },
  };
}

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

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    servePortfolioImages(),
    process.env.ANALYZE === 'true' && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
    command === 'build' && copyPublicSkipDeadFolder(),
  ].filter(Boolean) as Plugin[],
  /** `vite build` uses a manual public copy so a locked `letting-me-go` tree cannot abort the build. */
  publicDir: command === 'build' ? false : PUBLIC_DIR,
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
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
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    fs: {
      allow: ['..'],
    },
  },
}));
