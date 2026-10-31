import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The app talks to Supabase directly from the browser (hero slides in
 * HeroCarousel, Google reviews in TestimonialsSection). `connect-src` omitted the
 * Supabase origin, so every one of those requests was blocked by CSP in production.
 *
 * Nothing looked broken because both call sites fall back silently, the failure was
 * only visible as console errors. These tests assert each origin the client actually
 * calls is permitted, so a missing entry fails here instead of degrading in the wild.
 */

const repoRoot = resolve(__dirname, '..', '..', '..');

const CONFIG_PATHS = [
  resolve(repoRoot, 'vercel.json'),
  resolve(repoRoot, 'sites', 'mcc-cal-vite', 'vercel.json'),
];

function connectSrcDirective(configPath: string): string[] {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const csp = config.headers
    ?.flatMap((entry: { headers?: Array<{ key: string; value: string }> }) => entry.headers ?? [])
    .find((header: { key: string }) => header.key === 'Content-Security-Policy')?.value;

  expect(csp, `no Content-Security-Policy header in ${configPath}`).toBeTruthy();

  const directive = String(csp)
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('connect-src '));

  expect(directive, `no connect-src directive in ${configPath}`).toBeTruthy();
  return (directive as string).split(/\s+/).slice(1);
}

/** Origins the browser bundle is known to fetch from at runtime. */
const REQUIRED_SOURCES = [
  { source: "'self'", why: 'same-origin API routes' },
  { source: 'https://*.supabase.co', why: 'hero slides and Google reviews read Supabase directly' },
  { source: 'https://api.mcc-cal.com', why: 'companion API' },
  { source: 'https://media.rss.com', why: 'podcast feed' },
];

describe('CSP connect-src', () => {
  it.each(CONFIG_PATHS)('permits every origin the client fetches in %s', (configPath) => {
    const sources = connectSrcDirective(configPath);
    for (const { source, why } of REQUIRED_SOURCES) {
      expect(sources, `connect-src is missing ${source} (${why})`).toContain(source);
    }
  });

  it('keeps both configs in agreement', () => {
    const [root, app] = CONFIG_PATHS.map(connectSrcDirective);
    expect(root).toEqual(app);
  });

  it('does not open connect-src to everything', () => {
    // A bare wildcard would make this suite pass while providing no protection.
    for (const configPath of CONFIG_PATHS) {
      expect(connectSrcDirective(configPath)).not.toContain('*');
    }
  });
});
