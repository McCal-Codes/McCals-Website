#!/usr/bin/env node
/**
 * Folds changelog.d/*.md fragments into a dated section at the top of CHANGELOG.md.
 *
 * The fragments exist because every pull request used to edit the top of
 * CHANGELOG.md, so any two open pull requests conflicted on the same lines.
 * Resolving that costs a second full round of CI and a second set of Vercel
 * builds. A fragment is a new file, so two pull requests never collide.
 *
 * Run by hand at release, not in CI. Nothing should write to the repository
 * automatically; that is what produced the build loop fixed in #292.
 *
 * Usage:
 *   node scripts/changelog/assemble.js [--dry-run] [--date=YYYY-MM-DD]
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const FRAGMENT_DIR = path.join(ROOT, 'changelog.d');
const CHANGELOG = path.join(ROOT, 'CHANGELOG.md');
const HEADER = '# Changelog\n\n';

function parseArgs(argv) {
  const dateArg = argv.find((a) => a.startsWith('--date='));
  return {
    dryRun: argv.includes('--dry-run'),
    // Local date, not toISOString(): the latter is UTC and would file an evening
    // release under tomorrow.
    date: dateArg ? dateArg.slice('--date='.length) : localDate(),
  };
}

function localDate() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** README.md documents the convention and is never a fragment. */
function listFragments() {
  if (!fs.existsSync(FRAGMENT_DIR)) return [];
  return fs
    .readdirSync(FRAGMENT_DIR)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .sort()
    .map((name) => path.join(FRAGMENT_DIR, name));
}

function main() {
  const { dryRun, date } = parseArgs(process.argv.slice(2));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`Not a date: ${date}. Expected YYYY-MM-DD.`);
    process.exitCode = 1;
    return;
  }

  const fragments = listFragments();
  if (fragments.length === 0) {
    console.log('No fragments in changelog.d/. Nothing to assemble.');
    return;
  }

  const bodies = fragments.map((file) => fs.readFileSync(file, 'utf8').trim()).filter(Boolean);
  if (bodies.length === 0) {
    console.error('Every fragment was empty. Refusing to write an empty section.');
    process.exitCode = 1;
    return;
  }

  const existing = fs.readFileSync(CHANGELOG, 'utf8');
  if (!existing.startsWith(HEADER)) {
    console.error(`${CHANGELOG} does not start with "# Changelog". Refusing to guess where to insert.`);
    process.exitCode = 1;
    return;
  }

  const section = `## ${date}\n\n${bodies.join('\n\n')}\n\n`;
  const updated = HEADER + section + existing.slice(HEADER.length);

  if (dryRun) {
    console.log(section);
    console.log(`--dry-run: would fold ${fragments.length} fragment(s) and delete them.`);
    return;
  }

  fs.writeFileSync(CHANGELOG, updated, 'utf8');
  for (const file of fragments) fs.unlinkSync(file);

  console.log(`Folded ${fragments.length} fragment(s) into ${date}:`);
  for (const file of fragments) console.log(`  ${path.relative(ROOT, file)}`);
}

main();
