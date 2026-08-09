import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * `script-src` no longer allows 'unsafe-inline'. The two inline scripts in
 * index.html are permitted by SHA-256 hash instead, which means editing either one
 * without updating vercel.json silently breaks the page in production: the browser
 * refuses to run the script and the theme flash / hero preload stop working.
 *
 * These tests recompute the hashes from index.html and assert both config files
 * still allow exactly them, so that mistake fails here instead of in production.
 */

const repoRoot = resolve(__dirname, '..', '..', '..');
const indexHtmlPath = resolve(repoRoot, 'sites', 'mcc-cal-vite', 'index.html');

/** Matches inline <script> blocks, skipping external src and non-executable JSON-LD. */
const INLINE_SCRIPT = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;

function inlineScriptHashes(html: string): string[] {
  const hashes: string[] = [];
  for (const match of html.matchAll(INLINE_SCRIPT)) {
    const [, attrs, body] = match;
    // application/ld+json is data, not executable script, so CSP does not gate it.
    if (/type=["']application\/ld\+json["']/.test(attrs)) continue;
    hashes.push(`sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}`);
  }
  return hashes;
}

function scriptSrcDirective(configPath: string): string {
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const csp = config.headers
    ?.flatMap((entry: { headers?: Array<{ key: string; value: string }> }) => entry.headers ?? [])
    .find((header: { key: string }) => header.key === 'Content-Security-Policy')?.value;

  expect(csp, `no Content-Security-Policy header in ${configPath}`).toBeTruthy();

  const directive = String(csp)
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('script-src '));

  expect(directive, `no script-src directive in ${configPath}`).toBeTruthy();
  return directive as string;
}

const CONFIG_PATHS = [
  resolve(repoRoot, 'vercel.json'),
  resolve(repoRoot, 'sites', 'mcc-cal-vite', 'vercel.json'),
];

describe('CSP inline script hashes', () => {
  const html = readFileSync(indexHtmlPath, 'utf8');
  const hashes = inlineScriptHashes(html);

  it('finds the inline scripts it is meant to be guarding', () => {
    // If this drops to zero the other assertions would pass vacuously.
    expect(hashes.length).toBeGreaterThan(0);
  });

  it.each(CONFIG_PATHS)('allows every inline script in %s', (configPath) => {
    const directive = scriptSrcDirective(configPath);
    for (const hash of hashes) {
      expect(directive, `script-src is missing '${hash}' — update it after editing index.html`).toContain(hash);
    }
  });

  it.each(CONFIG_PATHS)('does not fall back to unsafe-inline in %s', (configPath) => {
    // Browsers ignore 'unsafe-inline' once a hash is present, so leaving it in would
    // be misleading rather than permissive — and it would mask a stale hash.
    expect(scriptSrcDirective(configPath)).not.toContain("'unsafe-inline'");
  });

  it.each(CONFIG_PATHS)('carries no hash for a script that no longer exists in %s', (configPath) => {
    const configured = scriptSrcDirective(configPath).match(/'sha256-[A-Za-z0-9+/=]+'/g) ?? [];
    const stale = configured
      .map((entry) => entry.replace(/'/g, ''))
      .filter((entry) => !hashes.includes(entry));

    expect(stale, 'remove hashes for inline scripts that were deleted from index.html').toEqual([]);
  });
});
