import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Read-only API routes are served from Vercel's CDN so that repeat visitors do not
 * cost a function invocation, and, for google-reviews, do not cost a billed Google
 * Places call.
 *
 * The rule these tests protect is the one that is easy to get wrong: a degraded or
 * failed response must never inherit the success TTL. Caching "reviews unavailable"
 * for an hour turns a blip into an hour-long outage that no deploy clears.
 */

const apiDir = resolve(__dirname, '..', 'api');
const read = (file: string) => readFileSync(resolve(apiDir, file), 'utf8');

/** Routes whose successful responses should be edge-cached, with the header they set. */
const CACHED_ROUTES = [
  { file: 'google-reviews.js', why: 'each origin miss is a billed Google Places API call' },
  { file: 'testimonials.js', why: 'approvals land on the order of days' },
  { file: 'podcast-feed.js', why: 'the RSS feed changes per episode' },
  { file: 'manifests/[type].js', why: 'manifests regenerate on a schedule, not per request' },
];

function sMaxAgeOf(source: string): number[] {
  return [...source.matchAll(/s-maxage=(\d+)/g)].map((match) => Number(match[1]));
}

describe('API cache headers', () => {
  it.each(CACHED_ROUTES)('$file sets an edge TTL because $why', ({ file }) => {
    const source = read(file);
    expect(source, `${file} should set s-maxage so the CDN can serve it`).toContain('s-maxage=');
  });

  it.each(CACHED_ROUTES)('$file lets browsers revalidate rather than pinning a copy', ({ file }) => {
    const source = read(file);
    // A long browser max-age strands updated content in a visitor's cache, where no
    // deploy or purge can reach it. The CDN copy is the one we control.
    const browserMaxAges = [...source.matchAll(/(?<!s-)max-age=(\d+)/g)].map((m) => Number(m[1]));
    for (const maxAge of browserMaxAges) {
      expect(maxAge, `${file} sets a browser max-age of ${maxAge}s; prefer max-age=0 with s-maxage`).toBeLessThanOrEqual(60);
    }
  });

  it('google-reviews does not cache errors or rate-limit rejections', () => {
    const source = read('google-reviews.js');
    expect(source).toContain("const NO_CACHE = 'no-store, max-age=0'");

    // The handler must set no-store before any early return, and only upgrade to the
    // cacheable header on the success path. Compare where the headers are *set*, not
    // where the constants are declared.
    const setsNoCache = source.indexOf("setHeader('Cache-Control', NO_CACHE)");
    const setsSuccess = source.indexOf("setHeader('Cache-Control', SUCCESS_CACHE_CONTROL)");

    expect(setsNoCache, 'expected the handler to default to no-store').toBeGreaterThan(-1);
    expect(setsSuccess, 'expected the success path to opt into caching').toBeGreaterThan(-1);
    expect(setsNoCache, 'no-store must be set first so early returns inherit it').toBeLessThan(setsSuccess);
  });

  it('testimonials caches its degraded fallback far more briefly than real data', () => {
    const source = read('testimonials.js');
    const ttls = sMaxAgeOf(source);
    expect(ttls.length, 'expected both a success and a degraded TTL').toBeGreaterThanOrEqual(2);
    expect(Math.min(...ttls), 'the degraded TTL should be short').toBeLessThanOrEqual(300);
    expect(Math.max(...ttls), 'the success TTL should be substantially longer').toBeGreaterThan(Math.min(...ttls) * 2);
  });

  it('does not edge-cache routes that accept submissions', () => {
    // contact and quote write data and are rate-limited per visitor; a shared cache
    // in front of either would be a correctness bug, not an optimization.
    for (const file of ['contact.js', 'quote.js']) {
      expect(read(file), `${file} must not set s-maxage`).not.toContain('s-maxage=');
    }
  });
});
