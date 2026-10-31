import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

/**
 * Every manifest generator stamped `generated: new Date().toISOString()` on each
 * run, so a manifest rebuilt from unchanged photographs still came out
 * different. seo-auto-update.yml regenerates them after a merge and commits what
 * changed; its "check for generated changes" guard always passed, because the
 * timestamp always moved. That commit lands inside sites/mcc-cal-vite, the
 * Vercel root directory, so it satisfied `ignoreCommand` and triggered a second
 * full production build for a one line diff per file.
 *
 * generate-sitemap.js also reads `generated` and publishes it as <lastmod>, so
 * the sitemap told search engines every gallery had been modified today, every
 * day.
 *
 * Reaching out of the app to test a repository script follows what
 * csp-inline-hashes.test.ts already does, and it is worth it: this is the only
 * unit test runner in the repository.
 */
const repoRoot = resolve(__dirname, '..', '..', '..');
const require = createRequire(import.meta.url);
const { writeManifestIfChanged } = require(
  join(repoRoot, 'scripts', 'manifest', 'write-manifest.js'),
) as {
  writeManifestIfChanged: (
    path: string,
    manifest: unknown,
    options?: Record<string, unknown>,
  ) => Promise<boolean>;
};

let dir: string;
let file: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'manifest-idempotence-'));
  file = join(dir, 'manifest.json');
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const manifest = (overrides: Record<string, unknown> = {}) => ({
  version: '1.0.0',
  generated: '2026-09-07T18:16:01.756Z',
  totalCollections: 2,
  collections: [{ collectionName: 'Wildlife' }],
  ...overrides,
});

describe('writeManifestIfChanged', () => {
  it('writes when there is no file yet', async () => {
    expect(await writeManifestIfChanged(file, manifest())).toBe(true);
    expect(JSON.parse(readFileSync(file, 'utf8')).totalCollections).toBe(2);
  });

  it('leaves the file alone when only the timestamp moved', async () => {
    await writeManifestIfChanged(file, manifest());
    const before = readFileSync(file, 'utf8');
    const mtimeBefore = statSync(file).mtimeMs;

    const written = await writeManifestIfChanged(
      file,
      manifest({ generated: '2026-09-07T18:54:23.320Z' }),
    );

    expect(written).toBe(false);
    // Both checked: an unchanged byte string is the point, and an untouched
    // mtime is what keeps the file out of a build cache invalidation too.
    expect(readFileSync(file, 'utf8')).toBe(before);
    expect(statSync(file).mtimeMs).toBe(mtimeBefore);
  });

  it('writes when anything other than the timestamp changed', async () => {
    await writeManifestIfChanged(file, manifest());

    const written = await writeManifestIfChanged(
      file,
      manifest({ generated: '2026-09-07T18:54:23.320Z', totalCollections: 3 }),
    );

    expect(written).toBe(true);
    expect(JSON.parse(readFileSync(file, 'utf8')).totalCollections).toBe(3);
  });

  it('treats a nested change as a change', async () => {
    await writeManifestIfChanged(file, manifest());

    const written = await writeManifestIfChanged(
      file,
      manifest({
        generated: '2026-09-07T18:54:23.320Z',
        collections: [{ collectionName: 'Wildlife' }, { collectionName: 'Landscapes' }],
      }),
    );

    expect(written).toBe(true);
  });

  it('does not blank generatedBy, which names the script rather than a time', async () => {
    await writeManifestIfChanged(file, manifest({ generatedBy: 'generate-events-manifest.js' }));

    const written = await writeManifestIfChanged(
      file,
      manifest({ generated: '2026-09-07T18:54:23.320Z', generatedBy: 'some-other-script.js' }),
    );

    expect(written).toBe(true);
  });

  it('writes anyway under force, for the existing --force flags', async () => {
    await writeManifestIfChanged(file, manifest());

    const written = await writeManifestIfChanged(
      file,
      manifest({ generated: '2026-09-07T18:54:23.320Z' }),
      { force: true },
    );

    expect(written).toBe(true);
    expect(JSON.parse(readFileSync(file, 'utf8')).generated).toBe('2026-09-07T18:54:23.320Z');
  });

  it('writes when the existing file is not valid JSON', async () => {
    writeFileSync(file, '{ truncated', 'utf8');
    expect(await writeManifestIfChanged(file, manifest())).toBe(true);
  });

  it('keeps each generator formatting, so this cannot reformat a manifest', async () => {
    // Several generators end the file with a newline and several do not. A
    // helper that imposed one style would rewrite every manifest once, which is
    // the diff it exists to avoid.
    await writeManifestIfChanged(file, manifest(), {
      serialize: (value: unknown) => `${JSON.stringify(value, null, 2)}\n`,
    });
    expect(readFileSync(file, 'utf8').endsWith('}\n')).toBe(true);
  });
});
