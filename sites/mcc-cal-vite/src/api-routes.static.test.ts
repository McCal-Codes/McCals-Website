import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * Vercel deploys every file under api/ as a live serverless function, whether or
 * not anything on the site calls it. Three routes had been sitting there
 * unreferenced: api/pdf-proxy.ts fetched any URL a caller named and returned the
 * bytes as application/pdf with Access-Control-Allow-Origin: * and a one year
 * immutable cache, and api/schedule/{availability,book}-enhanced.js were older
 * forks of the booking endpoints carrying their own hardcoded configuration.
 * None was reachable from the site, and none was reviewed again after it stopped
 * being reachable, which is why they were dangerous rather than merely untidy.
 *
 * Both checks are static on purpose. They read the source rather than calling
 * anything, so they run in CI with no network and no credentials.
 */

const siteRoot = resolve(__dirname, '..');
const API_DIR = resolve(siteRoot, 'api');
const SRC_DIR = resolve(siteRoot, 'src');

/** Files under _lib are shared modules; Vercel does not route to a leading underscore. */
function listRouteFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    if (entry.startsWith('_')) return [];
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listRouteFiles(full);
    return /\.(js|ts)$/.test(entry) ? [full] : [];
  });
}

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return listSourceFiles(full);
    return /\.(ts|tsx)$/.test(entry) ? [full] : [];
  });
}

const routeFiles = listRouteFiles(API_DIR);
const sourceText = listSourceFiles(SRC_DIR)
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

/** api/schedule/book.js -> /api/schedule/book, api/manifests/[type].js -> /api/manifests/ */
function routePath(file: string): string {
  const rel = relative(API_DIR, file).replace(/\.(js|ts)$/, '');
  // A dynamic segment is filled in at the call site, so match only up to it.
  return `/api/${rel.replace(/\[[^\]]+\].*$/, '')}`;
}

describe('every deployed API route is reachable from the site', () => {
  it.each(routeFiles.map((file) => [relative(API_DIR, file), file]))(
    'api/%s is referenced',
    (_name, file) => {
      // Matches both the fetch URL the app uses and the direct import the
      // endpoint tests use, so a route reachable either way counts as live.
      expect(sourceText).toContain(routePath(file as string));
    },
  );

  it('finds the routes at all, so an empty walk cannot pass vacuously', () => {
    expect(routeFiles.length).toBeGreaterThan(5);
  });
});

describe('every uncached API route bounds how often it can be hit', () => {
  it.each(routeFiles.map((file) => [relative(API_DIR, file), file]))(
    'api/%s is either rate limited or served from the shared cache',
    (_name, file) => {
      const source = readFileSync(file as string, 'utf8');
      // Two acceptable ways to bound origin work. A route with an s-maxage is
      // answered by the CDN for most callers, so the origin sees a trickle no
      // matter how hard the route is hit. A route without one runs on every
      // request and has to say no itself.
      //
      // api/schedule/availability.js satisfied neither: it sets `no-store` and
      // spent a Google Calendar events.list call per request, which is quota
      // that is not ours to give away.
      // Matched on the call, not the import. An earlier draft of this test
      // looked for the bare name and passed on a file that imported the limiter
      // and never invoked it, which is the exact shape of the bug it is here to
      // catch.
      const bounded = source.includes('await applyRateLimit(') || source.includes('s-maxage');
      expect(bounded).toBe(true);
    },
  );
});
