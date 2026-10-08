import { describe, expect, it, vi } from 'vitest';

// A Vercel preview deployment of a pull request. The environment is read when
// the modules load, so it is set before importing them, in a file of its own.
const SHA = '983944237f3d958cf775489fb761ea141fbed63b';
vi.stubEnv('PROD', true);
vi.stubEnv('DEV', false);
vi.stubEnv('VITE_VERCEL_ENV', 'preview');
vi.stubEnv('VITE_VERCEL_GIT_COMMIT_SHA', SHA);

const { getOptimizedImageUrl, getResponsiveImageSrcSet } =
  await import('./utils/imageOptimization');
const { imageUrl } = await import('./components/portfolio/useManifest');
const { WIDE_SRCSET_WIDTHS, LEAD_OPTIMIZED_WIDTH, frameCdnUrl, frameSrcSet, optimizedFrameUrl } =
  await import('./config/selected-work-image.js');
const { repoCdnBase } = await import('./config/repo-cdn.js');

/**
 * In a preview the page reads photographs from its own commit, so a pull request
 * that adds them shows them. The optimizer allowlist stays on main, so those urls
 * are served straight from jsDelivr. The prerendered preload has to reach the
 * same conclusion as the page, or the browser fetches an image nothing displays.
 */
const LEAD_PATH = 'Selected/20250609_kentucky_134.webp';

describe('selected-work urls in a preview deployment', () => {
  const folder = LEAD_PATH.slice(0, LEAD_PATH.lastIndexOf('/'));
  const filename = LEAD_PATH.slice(LEAD_PATH.lastIndexOf('/') + 1);
  const cdnBase = repoCdnBase(import.meta.env);
  const cdnUrl = frameCdnUrl(LEAD_PATH, cdnBase);

  it('reads the photograph at the deployment commit, the same url the page builds', () => {
    expect(cdnUrl).toContain(`McCals-Website@${SHA}/`);
    expect(cdnUrl).toBe(imageUrl.featured(folder, filename));
  });

  it('does not send a commit-ref url through the optimizer, exactly as the page does not', () => {
    for (const width of [...WIDE_SRCSET_WIDTHS, LEAD_OPTIMIZED_WIDTH]) {
      expect(optimizedFrameUrl(cdnUrl, width)).toBe(cdnUrl);
      expect(optimizedFrameUrl(cdnUrl, width)).toBe(getOptimizedImageUrl(cdnUrl, { width }));
    }
    expect(frameSrcSet(cdnUrl, WIDE_SRCSET_WIDTHS)).toBeUndefined();
    expect(getResponsiveImageSrcSet(cdnUrl, [...WIDE_SRCSET_WIDTHS])).toBeUndefined();
  });
});
