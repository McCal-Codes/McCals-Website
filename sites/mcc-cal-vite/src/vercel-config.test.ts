import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type VercelConfig = {
  buildCommand?: string;
  installCommand?: string;
  outputDirectory?: string;
  cleanUrls?: boolean;
  redirects?: Array<{ source: string; destination: string; permanent: boolean }>;
  rewrites?: Array<{ source: string; destination: string }>;
  headers?: unknown[];
  images?: unknown;
};

const repoRoot = resolve(__dirname, '..', '..', '..');

function readConfig(path: string): VercelConfig {
  return JSON.parse(readFileSync(path, 'utf8')) as VercelConfig;
}

function comparableConfig(config: VercelConfig) {
  const rest = { ...config };
  delete rest.buildCommand;
  delete rest.installCommand;
  delete rest.outputDirectory;
  return rest;
}

describe('Vercel config parity', () => {
  const rootConfig = readConfig(resolve(repoRoot, 'vercel.json'));
  const appConfig = readConfig(resolve(repoRoot, 'sites', 'mcc-cal-vite', 'vercel.json'));

  it('keeps deployment behavior aligned across root and app configs', () => {
    expect(comparableConfig(rootConfig)).toEqual(comparableConfig(appConfig));
  });

  it('serves generated route HTML through clean URLs', () => {
    expect(rootConfig.cleanUrls).toBe(true);
    expect(appConfig.cleanUrls).toBe(true);
  });

  it('keeps legacy redirects explicit without shadowing real public pages', () => {
    const sources = new Set(rootConfig.redirects?.map((redirect) => redirect.source));

    expect(sources).toContain('/schedule');
    expect(sources).toContain('/contact');
    expect(sources).not.toContain('/accessibility');
  });
});
