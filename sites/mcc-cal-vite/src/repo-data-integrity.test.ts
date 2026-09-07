import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(__dirname, '..', '..', '..');

describe('repository data integrity', () => {
  it('keeps MCP memory data as a single JSON object', () => {
    const memoryPath = resolve(repoRoot, 'src', 'data', 'memory.json');
    const memory = JSON.parse(readFileSync(memoryPath, 'utf8')) as {
      entities?: Record<string, unknown>;
      relations?: unknown[];
    };

    expect(memory.entities).toBeTruthy();
    expect(Array.isArray(memory.relations)).toBe(true);
  });

  it('keeps public Vercel functions under the app api directory only', () => {
    const publicApiPath = resolve(repoRoot, 'sites', 'mcc-cal-vite', 'api');
    const legacyShimPath = resolve(repoRoot, 'sites', 'mcc-cal-vite', 'src', 'pages', 'api');

    expect(existsSync(resolve(publicApiPath, 'contact.js'))).toBe(true);
    expect(existsSync(resolve(publicApiPath, 'quote.js'))).toBe(true);
    expect(existsSync(legacyShimPath)).toBe(false);
  });

  it('keeps SEO automation aligned with the Vite public app', () => {
    const workflowPath = resolve(repoRoot, '.github', 'workflows', 'seo-auto-update.yml');
    const workflow = readFileSync(workflowPath, 'utf8');
    const staleLegacyDomain = ['mccalmedia', 'com'].join('.');

    expect(workflow).toContain("SITE_URL: ${{ secrets.SITE_URL || 'https://mcc-cal.com' }}");
    expect(workflow).toContain('sites/mcc-cal-vite/dist/sitemap.xml');
    expect(workflow).toContain('sites/mcc-cal-vite/public-vite/sitemap.xml');
    expect(workflow).not.toContain(staleLegacyDomain);
    expect(workflow).not.toContain('dist/structured-data');
  });

  /**
   * jsDelivr refuses to serve any file over 20 MB, and jsDelivr is the CDN for
   * every gallery. A 24.3 MB frame in Nature/Flowers & Plants sat in
   * nature-manifest.json answering 403 while its 17 MB siblings answered 200,
   * so the gallery had a permanently broken image and nothing said so.
   *
   * The ceiling here is 5 MB rather than 20, because 20 only catches the file
   * that has already broken. The rest of the site sits around 250 KB at 2048px
   * on the long edge, so anything approaching 5 MB has skipped
   * `scripts/optimize-images.js` and is costing visitors bandwidth long before
   * it costs them the image.
   */
  it('keeps every portfolio image small enough for the CDN to serve', () => {
    const portfolios = resolve(repoRoot, 'src', 'images', 'Portfolios');
    if (!existsSync(portfolios)) return;

    const CEILING_BYTES = 5 * 1024 * 1024;
    const oversized: string[] = [];

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = resolve(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (/\.(jpe?g|png|webp|avif|gif)$/i.test(entry.name)) {
          const { size } = statSync(full);
          if (size > CEILING_BYTES) {
            oversized.push(`${(size / 1048576).toFixed(1)} MB  ${relative(repoRoot, full)}`);
          }
        }
      }
    };

    walk(portfolios);

    expect(
      oversized,
      'These images are too large to serve. Run ' +
        '`node scripts/optimize-images.js <Portfolio> --max-edge=2048` and commit the result.',
    ).toEqual([]);
  });
});
