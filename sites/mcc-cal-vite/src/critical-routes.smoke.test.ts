import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { LEGACY_ROUTE_REDIRECTS, SITEMAP_STATIC_PATHS } from './config/public-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function assertSitemapPathHasAppRoute(appSource: string, path: string): void {
  if (path.startsWith('/authors/') && path !== '/authors') {
    expect(appSource).toMatch(/path[:=]\s*['"{]\/authors\/:authorId/);
    return;
  }
  expect(appSource).toContain('STATIC_PAGE_ROUTES.map');
}

describe('critical public routes', () => {
  it('renders static routes from shared source in App.tsx', () => {
    const appPath = resolve(__dirname, 'App.tsx');
    const appSource = readFileSync(appPath, 'utf8');
    expect(appSource).toContain("from './config/public-routes.js'");
    expect(appSource).toContain('STATIC_PAGE_ROUTES.map');
  });

  it('registers every sitemap static path in App.tsx', () => {
    const appPath = resolve(__dirname, 'App.tsx');
    const appSource = readFileSync(appPath, 'utf8');
    for (const p of SITEMAP_STATIC_PATHS) {
      assertSitemapPathHasAppRoute(appSource, p);
    }
  });

  it('keeps local legacy redirects aligned with deployment redirects', () => {
    const appPath = resolve(__dirname, 'App.tsx');
    const appSource = readFileSync(appPath, 'utf8');

    expect(appSource).toContain('LEGACY_ROUTE_REDIRECTS.map');
    expect(LEGACY_ROUTE_REDIRECTS).toEqual(
      expect.arrayContaining([
        { from: '/schedule', to: '/grab-a-coffee' },
        { from: '/contact', to: '/contact-us' },
      ]),
    );
  });

  it('keeps primary public pages semantically headed', () => {
    const homeSource = readFileSync(resolve(__dirname, 'components', 'HeroCarousel.lazy.tsx'), 'utf8');
    const featuredSource = readFileSync(
      resolve(__dirname, 'components', 'portfolios', 'FeaturedPortfolio.tsx'),
      'utf8',
    );

    expect(homeSource).toMatch(/<h1\b/);
    expect(featuredSource).toMatch(/<h1\b/);
  });
});
