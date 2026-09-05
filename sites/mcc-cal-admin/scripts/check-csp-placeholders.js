#!/usr/bin/env node
/**
 * Fails a deployment build if vercel.json still contains an unsubstituted
 * <PLACEHOLDER> in its Content-Security-Policy.
 *
 * Vercel reads vercel.json before the build runs, so the CSP cannot be
 * generated from environment variables — the host has to be written into the
 * file. That makes it easy to ship a policy containing a literal
 * "<VITE_R2_PUBLIC_URL_HOST>", which is not a valid host source: the browser
 * silently drops it and blocks every R2 image and upload with nothing in the
 * build log to explain it.
 *
 * Locally this only warns, because the placeholder is what is committed and a
 * hard failure would block ordinary development. On Vercel it exits non-zero,
 * turning a silent runtime breakage into a loud build failure.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(here, '..', 'vercel.json');

const PLACEHOLDER = /<[A-Z0-9_]+>/g;

/** True when this is a real Vercel deployment rather than a local build. */
const isDeployment = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

function findPlaceholders(config) {
  const found = new Set();

  for (const entry of config.headers ?? []) {
    for (const header of entry.headers ?? []) {
      for (const match of String(header.value).matchAll(PLACEHOLDER)) {
        found.add(`${header.key}: ${match[0]}`);
      }
    }
  }

  return [...found];
}

let config;
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error(`check-csp-placeholders: could not read ${configPath}\n${error.message}`);
  process.exit(1);
}

const placeholders = findPlaceholders(config);

if (placeholders.length === 0) {
  process.exit(0);
}

const detail = placeholders.map((p) => `  - ${p}`).join('\n');

if (!isDeployment) {
  console.warn(
    `check-csp-placeholders: vercel.json still has unsubstituted placeholders:\n${detail}\n` +
      'Fine locally. This will fail the build on Vercel — see .env.example.',
  );
  process.exit(0);
}

console.error(
  `check-csp-placeholders: vercel.json has unsubstituted placeholders:\n${detail}\n\n` +
    'A literal <PLACEHOLDER> is not a valid CSP host source. The browser drops it\n' +
    'and blocks the matching requests with no console error naming this file.\n' +
    'Replace it with the real host before deploying (see .env.example).',
);
process.exit(1);
