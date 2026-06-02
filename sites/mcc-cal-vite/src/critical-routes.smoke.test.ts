import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SITEMAP_STATIC_PATHS } from './config/public-routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function assertSitemapPathHasAppRoute(appSource: string, path: string): void {
  if (path.startsWith('/authors/') && path !== '/authors') {
    expect(appSource).toMatch(/path[:=]\s*['"{]\/authors\/:authorId/);
    return;
  }
  expect(appSource).toContain('STATIC_PAGE_ROUTES.map');
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T;
}

interface VercelRedirect {
  source: string;
  destination: string;
  permanent?: boolean;
}

interface VercelConfig {
  redirects?: VercelRedirect[];
}

function expectRedirect(
  redirects: VercelRedirect[] | undefined,
  source: string,
  destination: string,
): void {
  expect(redirects).toContainEqual(
    expect.objectContaining({
      source,
      destination,
      permanent: true,
    }),
  );
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

    expect(appSource).toContain("path: '/schedule'");
    expect(appSource).toContain('to="/grab-a-coffee"');
    expect(appSource).toContain("path: '/contact'");
    expect(appSource).toContain('to="/contact-us"');
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

  it('keeps stale indexed portfolio URLs redirected in both Vercel configs', () => {
    const rootConfig = readJson<VercelConfig>(resolve(__dirname, '..', '..', '..', 'vercel.json'));
    const appConfig = readJson<VercelConfig>(resolve(__dirname, '..', 'vercel.json'));

    for (const config of [rootConfig, appConfig]) {
      expectRedirect(config.redirects, '/event', '/events');
      expectRedirect(config.redirects, '/featured', '/featured-work');
    }
  });

  it('does not expose placeholder phone data in static organization JSON-LD', () => {
    const indexSource = readFileSync(resolve(__dirname, '..', 'index.html'), 'utf8');

    expect(indexSource).toContain('contact@mcc-cal.com');
    expect(indexSource).not.toContain('+1-412-XXX-XXXX');
  });
});
