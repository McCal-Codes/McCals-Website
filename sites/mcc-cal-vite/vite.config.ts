import { defineConfig, type Connect, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PUBLIC_DIR = resolve(__dirname, './public-vite');
const SKIP_DIR_NAME = 'one-nation-divided';
const shouldUploadSentrySourceMaps = Boolean(
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT,
);
const sentryRelease = process.env.VERCEL_GIT_COMMIT_SHA
  ? `mcc-cal-vite@${process.env.VERCEL_GIT_COMMIT_SHA}`
  : undefined;

/**
 * Production build only: copy `public-vite` into `dist` but never enter a folder named `one-nation-divided`
 * (can be stuck with EPERM on some Windows / exFAT drives). Dev keeps normal `publicDir` behavior.
 */
function copyPublicSkipDeadFolder(): Plugin {
  let outDirAbs = '';

  const walk = (fromRoot: string, toRoot: string, rel: string) => {
    const dir = rel ? path.join(fromRoot, rel) : fromRoot;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      // Skip unreadable directories silently
      return;
    }
    for (const ent of entries) {
      if (ent.name === SKIP_DIR_NAME) {
        // Skip locked folder silently
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
    name: 'copy-public-skip-one-nation-divided',
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
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/src/images/Portfolios', (req: Connect.IncomingMessage, res, next) => {
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
      } catch {
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
    command === 'build' &&
      shouldUploadSentrySourceMaps &&
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: sentryRelease ? { name: sentryRelease } : undefined,
        sourcemaps: {
          filesToDeleteAfterUpload: ['dist/**/*.map'],
        },
      }),
    command === 'build' && copyPublicSkipDeadFolder(),
  ].filter(Boolean) as Plugin[],
  /** `vite build` uses a manual public copy so a locked `one-nation-divided` tree cannot abort the build. */
  publicDir: command === 'build' ? false : PUBLIC_DIR,
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    // 'hidden' generates sourcemaps for error tracking (e.g. Sentry)
    // without exposing them publicly in the browser DevTools
    sourcemap: shouldUploadSentrySourceMaps ? 'hidden' : false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (!normalizedId.includes('/node_modules/')) return undefined;
          if (
            normalizedId.includes('/node_modules/react/') ||
            normalizedId.includes('/node_modules/react-dom/') ||
            normalizedId.includes('/node_modules/scheduler/')
          ) {
            return 'react-vendor';
          }
          if (
            normalizedId.includes('/node_modules/react-router-dom/') ||
            normalizedId.includes('/node_modules/react-router/') ||
            normalizedId.includes('/node_modules/@remix-run/router/')
          ) {
            return 'router-vendor';
          }
          if (normalizedId.includes('/node_modules/@tanstack/react-query/')) {
            return 'query-vendor';
          }
          return undefined;
        },
      },
    },
  },
  define: {
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(
      process.env.VERCEL_ENV ?? process.env.VITE_VERCEL_ENV ?? 'development'
    ),
    'import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA': JSON.stringify(
      process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VITE_VERCEL_GIT_COMMIT_SHA ?? ''
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
