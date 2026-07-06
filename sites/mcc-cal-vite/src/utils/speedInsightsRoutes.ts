import { SITEMAP_STATIC_PATHS } from '@/config/public-routes.js';

const STATIC_PATHS = new Set(SITEMAP_STATIC_PATHS);
const LEGACY_REDIRECT_PATHS = new Set(['/contact', '/schedule', '/one-nation-divided']);

function normalizePathname(pathname: string): string {
  if (!pathname) return '/404';
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (path === '/') return path;
  return path.replace(/\/+$/, '');
}

export function getSpeedInsightsRoute(pathname: string): string {
  const path = normalizePathname(pathname);

  if (LEGACY_REDIRECT_PATHS.has(path)) return '/redirect';
  if (/^\/blog\/[^/]+$/.test(path)) return '/blog/[slug]';
  if (/^\/authors\/[^/]+$/.test(path)) return '/authors/[authorId]';
  if (STATIC_PATHS.has(path)) return path;

  return '/404';
}
