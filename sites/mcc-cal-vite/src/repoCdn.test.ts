import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  OPTIMIZABLE_CDN_PATHNAME,
  PRODUCTION_REF,
  REPO_CDN_ORIGIN,
  isOptimizableCdnUrl,
  repoCdnBase,
  resolveCdnRef,
} from './config/repo-cdn.js';

/**
 * Portfolio photographs are served by jsDelivr from a git ref. Production reads
 * `main`; a preview reads its own commit, so a pull request that adds photographs
 * can be reviewed with them visible. The optimizer allowlist in vercel.json stays
 * on `main`, and the client mirrors it so it never builds an optimizer url the
 * server would refuse.
 */

const SHA = '983944237f3d958cf775489fb761ea141fbed63b';

describe('resolveCdnRef', () => {
  it('reads main in production, even when a commit is known', () => {
    expect(resolveCdnRef({ VITE_VERCEL_ENV: 'production', VITE_VERCEL_GIT_COMMIT_SHA: SHA })).toBe(
      PRODUCTION_REF,
    );
  });

  it('reads the deployment commit in a preview', () => {
    expect(resolveCdnRef({ VITE_VERCEL_ENV: 'preview', VITE_VERCEL_GIT_COMMIT_SHA: SHA })).toBe(
      SHA,
    );
  });

  it('reads the same decision from the unprefixed variables a build script sees', () => {
    expect(resolveCdnRef({ VERCEL_ENV: 'preview', VERCEL_GIT_COMMIT_SHA: SHA })).toBe(SHA);
    expect(resolveCdnRef({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_SHA: SHA })).toBe('main');
  });

  it.each([
    ['no environment at all', {}],
    ['local development', { VITE_VERCEL_ENV: 'development', VITE_VERCEL_GIT_COMMIT_SHA: SHA }],
    ['a preview without a commit', { VITE_VERCEL_ENV: 'preview' }],
    [
      'an abbreviated commit',
      { VITE_VERCEL_ENV: 'preview', VITE_VERCEL_GIT_COMMIT_SHA: SHA.slice(0, 7) },
    ],
    [
      'an uppercase commit',
      { VITE_VERCEL_ENV: 'preview', VITE_VERCEL_GIT_COMMIT_SHA: SHA.toUpperCase() },
    ],
    [
      'a branch name',
      { VITE_VERCEL_ENV: 'preview', VITE_VERCEL_GIT_COMMIT_SHA: 'feat/selected-work' },
    ],
  ])('falls back to main for %s', (_label, env) => {
    expect(resolveCdnRef(env)).toBe('main');
  });

  it('builds the base url from the resolved ref', () => {
    expect(repoCdnBase({ VITE_VERCEL_ENV: 'preview', VITE_VERCEL_GIT_COMMIT_SHA: SHA })).toBe(
      `${REPO_CDN_ORIGIN}@${SHA}`,
    );
    expect(repoCdnBase()).toBe(`${REPO_CDN_ORIGIN}@main`);
  });
});

describe('isOptimizableCdnUrl', () => {
  const path = 'src/images/Portfolios/Journalism/Politics/a/photo%20one.jpg';

  it('accepts a portfolio photograph at main', () => {
    expect(isOptimizableCdnUrl(`${REPO_CDN_ORIGIN}@main/${path}`)).toBe(true);
  });

  it.each([
    ['a commit ref', `${REPO_CDN_ORIGIN}@${SHA}/${path}`],
    ['another repository', `https://cdn.jsdelivr.net/gh/someone/else@main/${path}`],
    ['a path outside the portfolio tree', `${REPO_CDN_ORIGIN}@main/package.json`],
    ['another host', `https://example.com/gh/McCal-Codes/McCals-Website@main/${path}`],
    ['something that is not a url', 'not a url'],
  ])('refuses %s', (_label, url) => {
    expect(isOptimizableCdnUrl(url)).toBe(false);
  });
});

describe('the client and vercel.json agree on the optimizer allowlist', () => {
  // vercel.json is shared by preview and production. Allowing commit refs there
  // would let production's optimizer transform photographs from any commit in the
  // history, so it stays on main, and a client that built optimizer urls for
  // other refs would get them refused. These must be the same string.
  it.each([
    ['the app config', resolve(__dirname, '..', 'vercel.json')],
    ['the repository root config', resolve(__dirname, '..', '..', '..', 'vercel.json')],
  ])('matches the jsDelivr remote pattern in %s', (_label, file) => {
    const config = JSON.parse(readFileSync(file, 'utf8')) as {
      images?: { remotePatterns?: Array<{ hostname: string; pathname: string }> };
    };
    const jsdelivr = config.images?.remotePatterns?.filter(
      (pattern) => pattern.hostname === 'cdn.jsdelivr.net',
    );

    expect(jsdelivr).toHaveLength(1);
    expect(jsdelivr?.[0].pathname).toBe(OPTIMIZABLE_CDN_PATHNAME);
  });
});
