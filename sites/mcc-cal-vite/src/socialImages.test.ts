import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  SOCIAL_IMAGE_SOURCES,
  TRANSFORM,
  fingerprintInputs,
  shouldRegenerate,
} from '../scripts/generate-social-images.js';

/**
 * The social preview images are regenerated only when what they are made from
 * changes. Re-encoding them on every build made two of them differ between macOS
 * and the Linux runners, so seo-auto-update.yml rewrote them after each merge
 * from a Mac, with a second production build each time.
 */

const appRoot = resolve(__dirname, '..');
const repoRoot = resolve(appRoot, '..', '..');
const inputs = { source: 'src/images/a.jpg', imagePath: '/images/social/a-og.jpg' };
const bytes = Buffer.from('photograph bytes');

describe('fingerprintInputs', () => {
  const base = fingerprintInputs(bytes, inputs);

  it('is stable for the same inputs', () => {
    expect(fingerprintInputs(Buffer.from('photograph bytes'), { ...inputs })).toBe(base);
  });

  it.each([
    ['the source bytes', () => fingerprintInputs(Buffer.from('other bytes'), inputs)],
    ['the source path', () => fingerprintInputs(bytes, { ...inputs, source: 'src/images/b.jpg' })],
    [
      'the page it belongs to',
      () => fingerprintInputs(bytes, { ...inputs, imagePath: '/images/social/b-og.jpg' }),
    ],
    ['the transform', () => fingerprintInputs(bytes, inputs, { ...TRANSFORM, quality: 90 })],
  ])('changes when %s change', (_label, other) => {
    expect(other()).not.toBe(base);
  });
});

describe('shouldRegenerate', () => {
  it('leaves an existing image alone when its inputs are unchanged', () => {
    expect(shouldRegenerate({ recorded: 'k', fingerprint: 'k', outputExists: true })).toBe(false);
  });

  it.each([
    ['its inputs changed', { recorded: 'old', fingerprint: 'new', outputExists: true }],
    ['it was never recorded', { recorded: undefined, fingerprint: 'new', outputExists: true }],
    ['the image is missing', { recorded: 'k', fingerprint: 'k', outputExists: false }],
    ['it is forced', { recorded: 'k', fingerprint: 'k', outputExists: true, force: true }],
  ])('regenerates when %s', (_label, args) => {
    expect(shouldRegenerate(args)).toBe(true);
  });
});

describe('the committed record', () => {
  it('matches the inputs of every committed social image', () => {
    // If this fails, a source photograph, its page mapping or the transform changed
    // without the images being regenerated. Run `node scripts/generate-social-images.js`
    // and commit the images together with scripts/social-images.inputs.json.
    const pageSeo = JSON.parse(
      readFileSync(resolve(appRoot, 'src', 'content', 'pageSeoData.json'), 'utf8'),
    ) as Record<string, { imagePath: string }>;
    const recorded = JSON.parse(
      readFileSync(resolve(appRoot, 'scripts', 'social-images.inputs.json'), 'utf8'),
    ) as Record<string, string>;

    const current = Object.fromEntries(
      Object.entries(SOCIAL_IMAGE_SOURCES).map(([key, source]) => [
        key,
        fingerprintInputs(readFileSync(resolve(repoRoot, source)), {
          source,
          imagePath: pageSeo[key].imagePath,
        }),
      ]),
    );

    expect(recorded).toEqual(current);
  });
});
