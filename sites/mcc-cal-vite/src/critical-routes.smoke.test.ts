import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * First column of STATIC_ROUTES in `scripts/generate-sitemap.js`.
 * Keeps sitemap-discoverable URLs wired in `App.tsx` (dynamic /authors/* uses :authorId).
 */
const SITEMAP_STATIC_PATHS: readonly string[] = [
  '/',
  '/about',
  '/contact-us',
  '/request-a-quote',
  '/featured-work',
  '/letting-me-go',
  '/journalism',
  '/portraits',
  '/nature',
  '/video',
  '/events',
  '/concerts',
  '/blog',
  '/authors',
  '/authors/mccal',
  '/podcast',
  '/book-a-podcast',
  '/grab-a-coffee',
  '/faq',
  '/design-systems',
  '/projects',
  '/terranova',
  '/policies-legal',
];

function assertSitemapPathHasAppRoute(appSource: string, path: string): void {
  if (path.startsWith('/authors/') && path !== '/authors') {
    expect(appSource).toContain('path="/authors/:authorId"');
    return;
  }
  expect(appSource).toContain(`path="${path}"`);
}

describe('critical public routes', () => {
  it('registers every sitemap static path in App.tsx', () => {
    const appPath = resolve(__dirname, 'App.tsx');
    const appSource = readFileSync(appPath, 'utf8');
    for (const p of SITEMAP_STATIC_PATHS) {
      assertSitemapPathHasAppRoute(appSource, p);
    }
  });
});
