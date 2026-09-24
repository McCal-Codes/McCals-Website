/**
 * Single source of truth for how /featured-work requests its photographs.
 *
 * Two places need these values and they must agree exactly:
 *
 *   FeaturedPortfolio.tsx renders the <img srcset sizes>.
 *   scripts/generate-route-meta.js emits a <link rel="preload" imagesrcset imagesizes>
 *   into the prerendered HTML so the first photograph is discoverable before the
 *   183 KB of JavaScript and the manifest round trip that would otherwise have to
 *   finish before its URL is even known.
 *
 * A preload whose candidate list differs from the img's makes the browser fetch a
 * second, unused image at high priority, which is worse than no preload at all.
 * Keeping the numbers here, rather than copied into both files, is what stops that.
 *
 * The CDN base and the optimizer allowlist come from repo-cdn.js, shared with
 * useManifest.ts and imageOptimization.ts, so a preview and its prerendered
 * preload agree on which commit a photograph is read from and whether it goes
 * through the optimizer at all.
 *
 * Every width must also appear in vercel.json's `images.sizes`. The optimizer
 * answers 400 for any other `w=`, which is the failure imageWidths.static.test.ts
 * exists to catch; it reads the `_WIDTHS` constants below by name.
 */

import { isOptimizableCdnUrl, repoCdnBase } from './repo-cdn.js';

/** Full-column frames. */
export const WIDE_SRCSET_WIDTHS = [640, 960, 1280, 1600, 1920];

/** Frames that sit two to a row, so roughly half the column. */
export const PAIR_SRCSET_WIDTHS = [480, 640, 960, 1280];

export const WIDE_SIZES = '(max-width: 900px) calc(100vw - 40px), min(1100px, 92vw)';
export const PAIR_SIZES = '(max-width: 700px) calc(100vw - 40px), (max-width: 1200px) 46vw, 540px';

/**
 * The narrowest photograph allowed a full-width row. That row renders up to 1100
 * CSS pixels (WIDE_SIZES), so a narrower source is enlarged and softened there.
 * 1600 fills it at about one and a half times, the density the wide candidates
 * are chosen for. A narrower frame is paired instead, where the column is about
 * half as wide. Checked against the committed selection: frames of 1080 and 640
 * pixels had been landing in wide rows.
 */
export const WIDE_MIN_SOURCE_WIDTH = 1600;

/** What the browser should fetch first, and at what width, for the lead frame. */
export const LEAD_OPTIMIZED_WIDTH = 1280;

/** Matches DEFAULT_QUALITY in src/utils/imageOptimization.ts. */
export const IMAGE_QUALITY = 80;

/** Matches VERCEL_IMAGE_PATH in src/utils/imageOptimization.ts. */
export const VERCEL_IMAGE_PATH = '/_vercel/image';

/** Matches PORTFOLIOS_BASE in src/components/portfolio/useManifest.ts. */
export const PORTFOLIOS_BASE = 'src/images/Portfolios';

/**
 * The CDN url for a curated frame, from its path relative to PORTFOLIOS_BASE.
 * Mirrors imageUrl.featured() plus toGithubUrl(), which encode each path segment
 * separately so a folder name with spaces survives.
 */
export function frameCdnUrl(pathRelativeToPortfolios, cdnBase = repoCdnBase()) {
  const repoPath = `${PORTFOLIOS_BASE}/${pathRelativeToPortfolios}`;
  const encoded = repoPath.split('/').map(encodeURIComponent).join('/');
  return `${cdnBase}/${encoded}`;
}

/**
 * The optimizer url for one candidate. Mirrors getOptimizedImageUrl() for a
 * jsDelivr source in the Vercel runtime, including returning a url the optimizer
 * would reject unchanged. selectedWorkPreload.test.ts asserts this stays
 * identical to that function's output in production and in a preview.
 */
export function optimizedFrameUrl(cdnUrl, width, quality = IMAGE_QUALITY) {
  if (!isOptimizableCdnUrl(cdnUrl)) return cdnUrl;
  const params = new URLSearchParams({ url: cdnUrl, q: String(quality) });
  if (width) params.set('w', String(width));
  return `${VERCEL_IMAGE_PATH}?${params.toString()}`;
}

/**
 * The candidate list for one frame, in the same order the img builds it, or
 * undefined where the optimizer cannot serve the url and the img has no srcset.
 */
export function frameSrcSet(cdnUrl, widths) {
  if (!isOptimizableCdnUrl(cdnUrl)) return undefined;
  return widths.map((width) => `${optimizedFrameUrl(cdnUrl, width)} ${width}w`).join(', ');
}
