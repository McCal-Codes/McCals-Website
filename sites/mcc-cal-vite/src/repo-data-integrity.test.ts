import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
});
