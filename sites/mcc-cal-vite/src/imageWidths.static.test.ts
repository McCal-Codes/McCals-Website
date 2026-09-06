import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Guard: every image width the app requests from Vercel's Image
 * Optimization API must be in vercel.json's `images.sizes` allowlist.
 * The optimizer rejects any other `w=` value with a 400, which surfaced
 * as the hero slideshow's "Image unavailable" bug (a 2560w srcset entry
 * that was never in the allowlist). This test makes that class of bug a
 * CI failure instead of a production incident.
 */

const appRoot = join(__dirname, '..');
const vercelConfig = JSON.parse(readFileSync(join(appRoot, 'vercel.json'), 'utf8')) as {
  images?: { sizes?: number[] };
};
const allowedSizes = new Set(vercelConfig.images?.sizes ?? []);

function collectSourceFiles(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, files);
    } else if (/\.(ts|tsx)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

interface WidthUsage {
  file: string;
  context: string;
  widths: number[];
}

function parseWidths(list: string): number[] {
  return list
    .split(',')
    .map((part) => Number.parseInt(part.trim(), 10))
    .filter((value) => Number.isFinite(value));
}

function findWidthUsages(): WidthUsage[] {
  const usages: WidthUsage[] = [];
  const patterns: Array<{ regex: RegExp; label: string }> = [
    // getResponsiveImageSrcSet(src, [640, 960, ...])
    { regex: /getResponsiveImageSrcSet\([^,)]+,\s*\[([\d,\s]+)\]/g, label: 'getResponsiveImageSrcSet call' },
    // const FOO_WIDTHS = [640, 960, ...]
    { regex: /_WIDTHS\s*=\s*\[([\d,\s]+)\]/g, label: 'width constant' },
    // getOptimizedImageUrl(src, { width: 1920 })
    { regex: /getOptimizedImageUrl\([^)]*\{\s*width:\s*(\d+)/g, label: 'getOptimizedImageUrl call' },
    // <OptimizedImage optimizedWidth={160} .../>
    { regex: /optimizedWidth=\{(\d+)\}/g, label: 'optimizedWidth prop' },
  ];

  for (const file of collectSourceFiles(join(appRoot, 'src'))) {
    const source = readFileSync(file, 'utf8');
    for (const { regex, label } of patterns) {
      for (const match of source.matchAll(regex)) {
        const widths = parseWidths(match[1]);
        if (widths.length > 0) {
          usages.push({ file: relative(appRoot, file), context: label, widths });
        }
      }
    }
  }

  return usages;
}

describe('image width allowlist', () => {
  it('vercel.json declares an images.sizes allowlist', () => {
    expect(allowedSizes.size).toBeGreaterThan(0);
  });

  it('every requested image width is in vercel.json images.sizes', () => {
    const usages = findWidthUsages();
    // If this drops to zero the regexes have drifted from the codebase and
    // the guard is silently dead, fail loudly instead.
    expect(usages.length).toBeGreaterThan(0);

    const violations = usages.flatMap(({ file, context, widths }) =>
      widths
        .filter((width) => !allowedSizes.has(width))
        .map((width) => `${file} (${context}): ${width} is not in vercel.json images.sizes`),
    );

    expect(violations).toEqual([]);
  });
});
