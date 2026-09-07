/**
 * Keeps the published cookie and storage inventory tied to what the code really
 * does.
 *
 * The inventory had drifted badly: it listed mccal_session, mccal_consent and
 * mccal_theme, none of which existed, while the five keys the site actually
 * writes went undeclared. Prose in a compliance page has nothing to hold it in
 * place, so this reads the source and compares both directions - a declared key
 * that no longer exists is as much a defect as a real key that was never
 * declared.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { cookieCategories, LAST_REVIEWED } from './accessibility-policy';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Every localStorage write in this codebase goes through a `const *_KEY` or
 * `const *_STORAGE_KEY` declaration rather than a literal at the call site, so
 * collecting the declarations collects the keys. If that convention is ever
 * broken, the "declared but not in source" half of this test still catches the
 * resulting mismatch.
 */
const KEY_DECLARATION = /^\s*(?:export\s+)?const\s+[A-Z0-9_]*(?:KEY|STORAGE)[A-Z0-9_]*\s*=\s*'([^']+)'/gm;

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) return sourceFiles(full);
    if (!/\.tsx?$/.test(entry) || /\.test\.tsx?$/.test(entry)) return [];
    return [full];
  });
}

const allSource = sourceFiles(SRC).map((file) => ({ file, text: readFileSync(file, 'utf8') }));

function keysWrittenByTheApp(): Set<string> {
  const found = new Set<string>();
  for (const { text } of allSource) {
    for (const match of text.matchAll(KEY_DECLARATION)) found.add(match[1]);
  }
  return found;
}

const firstPartyKeys = cookieCategories
  .flatMap((category) => category.cookies)
  .filter((entry) => entry.provider === 'McCal Media')
  .map((entry) => entry.name);

describe('accessibility page storage inventory', () => {
  it('declares every storage key the app writes', () => {
    const written = [...keysWrittenByTheApp()].sort();
    const missing = written.filter((key) => !firstPartyKeys.includes(key));

    expect(
      missing,
      `These keys are written by the app but are not listed on /accessibility. ` +
        `Add them to cookieCategories in src/pages/accessibility.tsx.`,
    ).toEqual([]);
  });

  it('does not list storage keys that no longer exist', () => {
    // Compared against the declarations rather than a plain text search: the
    // inventory lives in src/ too, so searching the source for a listed name
    // finds the listing itself and passes vacuously. That self-reference is
    // how three fictional keys sat here unnoticed.
    const written = keysWrittenByTheApp();
    const fictional = firstPartyKeys.filter((key) => !written.has(key));

    expect(
      fictional,
      `These keys are published on /accessibility but no code declares them. ` +
        `Remove them, correct the name, or - if one is written from an inline ` +
        `literal - hoist it to a *_KEY constant so it is visible here.`,
    ).toEqual([]);
  });

  it('makes no claim about cookies this site sets itself', () => {
    // The site sets none. If that ever changes, the prose in the "What Are
    // Cookies?" section becomes false and has to be rewritten alongside it.
    const setsCookies = allSource.filter(({ text }) => /document\s*\.\s*cookie\s*=/.test(text));

    expect(
      setsCookies.map(({ file }) => path.relative(SRC, file)),
      'This site claims to set no cookies of its own. Update /accessibility first.',
    ).toEqual([]);
  });

  it('pins the review date instead of computing it', () => {
    // Was `new Date()`, which advertised a fresh assessment every single day.
    expect(LAST_REVIEWED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${LAST_REVIEWED}T12:00:00Z`).getTime()).not.toBeNaN();
    expect(new Date(`${LAST_REVIEWED}T12:00:00Z`).getTime()).toBeLessThanOrEqual(Date.now());
  });
});
