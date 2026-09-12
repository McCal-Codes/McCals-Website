import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.stubEnv('PROD', true);
vi.stubEnv('VITE_VERCEL_ENV', 'production');
// useManifest's imageUrl serves local paths under import.meta.env.DEV, which
// Vitest leaves true. The preload only ships in a built page, so compare against
// the production branch.
vi.stubEnv('DEV', false);

const { getOptimizedImageUrl, getResponsiveImageSrcSet } =
  await import('./utils/imageOptimization');
const { imageUrl, getStaticManifestUrl } = await import('./components/portfolio/useManifest');
const {
  WIDE_SRCSET_WIDTHS,
  WIDE_SIZES,
  LEAD_OPTIMIZED_WIDTH,
  frameCdnUrl,
  frameSrcSet,
  optimizedFrameUrl,
} = await import('./config/selected-work-image.js');

/**
 * scripts/generate-route-meta.js emits a preload for the lead photograph of
 * /featured-work, and it has to build that url in Node, where it cannot call the
 * app's own image helpers: they read import.meta.env. So selected-work-image.js
 * reimplements the url shape, and this file is what stops the two from drifting.
 *
 * Drift here is not a crash. The page keeps working and the browser quietly
 * downloads a second full-size photograph at the highest priority that it then
 * never displays, which is strictly worse than emitting no preload at all.
 */

const LEAD_PATH = 'Journalism/Politics/cmu-trump-protest/250715_CMU Trump Protest_CAL1573-min.jpg';

describe('selected-work preload url matches what the page requests', () => {
  it('builds the same CDN url as imageUrl.featured', () => {
    const lastSlash = LEAD_PATH.lastIndexOf('/');
    const folder = LEAD_PATH.slice(0, lastSlash);
    const filename = LEAD_PATH.slice(lastSlash + 1);

    expect(frameCdnUrl(LEAD_PATH)).toBe(imageUrl.featured(folder, filename));
  });

  it('builds the same optimizer url as getOptimizedImageUrl, at every curated width', () => {
    const cdnUrl = frameCdnUrl(LEAD_PATH);

    for (const width of [...WIDE_SRCSET_WIDTHS, LEAD_OPTIMIZED_WIDTH]) {
      expect(optimizedFrameUrl(cdnUrl, width)).toBe(getOptimizedImageUrl(cdnUrl, { width }));
    }
  });

  it('builds the same candidate list as getResponsiveImageSrcSet', () => {
    const cdnUrl = frameCdnUrl(LEAD_PATH);

    expect(frameSrcSet(cdnUrl, WIDE_SRCSET_WIDTHS)).toBe(
      getResponsiveImageSrcSet(cdnUrl, [...WIDE_SRCSET_WIDTHS]),
    );
  });

  it('encodes each path segment separately, so a folder with spaces survives', () => {
    // %2520 rather than %20: the space is encoded once into the CDN url, then the
    // whole url is encoded again as the optimizer's `url` parameter.
    const url = optimizedFrameUrl(frameCdnUrl(LEAD_PATH), 640);
    expect(url).toContain('%2520Trump%2520Protest');
    expect(url).not.toContain(' ');
  });

  it('keeps the component and the prerenderer reading one shared module', () => {
    const component = readFileSync(
      resolve(__dirname, 'components', 'portfolios', 'FeaturedPortfolio.tsx'),
      'utf8',
    );
    const prerenderer = readFileSync(
      resolve(__dirname, '..', 'scripts', 'generate-route-meta.js'),
      'utf8',
    );

    for (const source of [component, prerenderer]) {
      expect(source).toMatch(/selected-work-image/);
    }
    // A literal width array in either file would be a copy that can drift.
    expect(component).not.toMatch(/WIDE_SRCSET_WIDTHS\s*=\s*\[/);
    expect(prerenderer).not.toMatch(/WIDE_SRCSET_WIDTHS\s*=\s*\[/);
  });

  it('uses the sizes attribute the wide frames actually render with', () => {
    expect(WIDE_SIZES).toBe('(max-width: 900px) calc(100vw - 40px), min(1100px, 92vw)');
  });
});

describe('the page and the prerenderer describe the same manifest', () => {
  const prerenderer = readFileSync(
    resolve(__dirname, '..', 'scripts', 'generate-route-meta.js'),
    'utf8',
  );

  it('reads the built featured manifest, not the curation file', () => {
    // Nothing in the build regenerates the manifest from featured-curation.json, so
    // a curation edit committed without regenerating left the preload and the
    // ImageObjects describing a sequence the page did not render.
    expect(prerenderer).toMatch(/['"]manifests['"],\s*['"]featured-manifest\.json['"]/);
    expect(prerenderer).not.toMatch(/featured-curation\.json['"]\s*\)/);
    expect(prerenderer).not.toMatch(/path\.join\([^)]*['"]featured-curation\.json['"]/);
  });
});

describe('versioned manifest urls', () => {
  it('versions the featured manifest url by the schema its generator writes', () => {
    // A browser may serve /manifests/* stale for a day. A new query string is a new
    // cache key, so new code cannot be answered with a document in the old shape.
    const served = JSON.parse(
      readFileSync(
        resolve(__dirname, '..', 'public-vite', 'manifests', 'featured-manifest.json'),
        'utf8',
      ),
    ) as { version: string; frames?: unknown[] };
    const major = Number.parseInt(served.version.split('.')[0], 10);

    expect(Array.isArray(served.frames)).toBe(true);
    expect(getStaticManifestUrl('featured')).toBe(`/manifests/featured-manifest.json?v=${major}`);
  });

  it('leaves manifests whose schema has not changed on their plain url', () => {
    expect(getStaticManifestUrl('journalism')).toBe('/manifests/journalism-manifest.json');
    expect(getStaticManifestUrl('events')).toBe('/manifests/events-manifest.json');
    expect(getStaticManifestUrl('nope')).toBeUndefined();
  });
});
