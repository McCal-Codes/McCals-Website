// @vitest-environment node
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * scripts/manifest/generate-featured-manifest.js turns featured-curation.json into
 * the manifest /featured-work renders. Its checks were only ever exercised by
 * hand, and a review found one of them checked shape and nothing else: a date of
 * "2025-13-01" passed and was published as "undefined 1, 2025".
 *
 * Reaching out of the app to test a repository script follows
 * manifest-idempotence.test.ts; this is the only unit test runner in the
 * repository. The generator runs only when invoked as a script, so requiring it
 * here does not write the real manifest.
 */
const repoRoot = resolve(__dirname, '..', '..', '..');
const portfoliosBase = join(repoRoot, 'src', 'images', 'Portfolios');
const require = createRequire(import.meta.url);

type Frame = Record<string, unknown>;
const { resolveFrames, formatFrameDate, isRealCalendarDate } = require(
  join(repoRoot, 'scripts', 'manifest', 'generate-featured-manifest.js'),
) as {
  resolveFrames: (frames: Frame[], base?: string) => Promise<Array<Record<string, unknown>>>;
  formatFrameDate: (iso: string) => string;
  isRealCalendarDate: (iso: unknown) => boolean;
};

const REAL_FRAME = 'Journalism/Politics/cmu-trump-protest/250715_CMU Trump Protest_CAL1573-min.jpg';

function frame(overrides: Frame = {}): Frame {
  return {
    path: REAL_FRAME,
    title: 'A frame',
    caption: 'A caption. (Photo by Caleb McCartney)',
    date: '2025-07-15',
    ...overrides,
  };
}

describe('isRealCalendarDate', () => {
  it.each(['2024-02-29', '2025-06-09', '2025-12-31', '2026-03-27'])('accepts %s', (iso) => {
    expect(isRealCalendarDate(iso)).toBe(true);
  });

  it.each([
    ['2025-13-01', 'a thirteenth month'],
    ['2025-00-10', 'a month zero'],
    ['2025-02-31', 'February 31'],
    ['2025-04-31', 'April 31'],
    ['2023-02-29', 'February 29 outside a leap year'],
    ['2025-6-9', 'a date missing its padding'],
    ['June 9, 2025', 'a date in prose'],
  ])('rejects %s (%s)', (iso) => {
    expect(isRealCalendarDate(iso)).toBe(false);
  });

  it('rejects a value that is not a string at all', () => {
    expect(isRealCalendarDate(undefined)).toBe(false);
    expect(isRealCalendarDate(20250609)).toBe(false);
  });
});

describe('formatFrameDate', () => {
  it('writes AP style, abbreviating every month but March through July', () => {
    expect(formatFrameDate('2024-10-14')).toBe('Oct. 14, 2024');
    expect(formatFrameDate('2024-09-05')).toBe('Sept. 5, 2024');
    expect(formatFrameDate('2026-03-27')).toBe('March 27, 2026');
    expect(formatFrameDate('2025-07-15')).toBe('July 15, 2025');
  });
});

describe('resolveFrames', () => {
  it('resolves a real frame with the dimensions the layout needs', async () => {
    const [resolved] = await resolveFrames([frame()], portfoliosBase);

    expect(resolved.width).toBe(3246);
    expect(resolved.height).toBe(2160);
    expect(resolved.dateDisplay).toBe('July 15, 2025');
  });

  it('fails on an impossible date rather than publishing it', async () => {
    await expect(resolveFrames([frame({ date: '2025-02-31' })], portfoliosBase)).rejects.toThrow(
      /2025-02-31, which is not a real day/,
    );
  });

  it('fails on a path that does not resolve rather than emitting a url that 404s', async () => {
    await expect(
      resolveFrames([frame({ path: 'Journalism/nope/missing.jpg' })], portfoliosBase),
    ).rejects.toThrow(/does not resolve on disk: Journalism\/nope\/missing\.jpg/);
  });

  it('reports every broken frame in one run instead of stopping at the first', async () => {
    const run = resolveFrames(
      [
        frame({ path: 'Journalism/nope/missing.jpg' }),
        frame({ date: '2025-13-01' }),
        frame({ date: 'June 9, 2025' }),
        frame(),
      ],
      portfoliosBase,
    );

    await expect(run).rejects.toThrow(/^3 problems in /);
    await expect(run).rejects.toThrow(/frames\[0\] does not resolve/);
    await expect(run).rejects.toThrow(/frames\[1\].*2025-13-01, which is not a real day/);
    await expect(run).rejects.toThrow(/frames\[2\].*needs a date as YYYY-MM-DD/);
  });
});

describe('the committed curation file', () => {
  it('dates every frame with a real day', () => {
    const curation = JSON.parse(
      readFileSync(join(repoRoot, 'scripts', 'manifest', 'featured-curation.json'), 'utf8'),
    ) as { frames: Array<{ path: string; date: string }> };

    const impossible = curation.frames
      .filter((entry) => !isRealCalendarDate(entry.date))
      .map((entry) => `${entry.date} on ${entry.path}`);

    expect(curation.frames.length).toBeGreaterThan(0);
    expect(impossible).toEqual([]);
  });
});
