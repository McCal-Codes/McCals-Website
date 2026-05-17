#!/usr/bin/env node
/**
 * Audits the generated Journalism manifest for AP-style photo captions.
 *
 * The manifest is the site-facing source used by cards, lightboxes, alt text
 * fallbacks, and structured metadata, so this catches both source-caption gaps
 * and generator matching regressions.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_MANIFEST = path.join(
  REPO_ROOT,
  'src/images/Portfolios/Journalism/journalism-manifest.json'
);

const IMAGE_ID_RE = /(?:^|[_\s-])(CAL\d+)(?:[_\s.-]|$)/i;
const DATE_RE =
  /\b(?:Jan\.|Feb\.|March|April|May|June|July|Aug\.|Sept\.|Oct\.|Nov\.|Dec\.) \d{1,2}, \d{4}\b/;

function parseArgs(argv) {
  const args = {
    category: null,
    manifest: DEFAULT_MANIFEST,
    allowSamePhotoDuplicates: true,
    requireCredit: true,
    requireDate: true,
  };

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    if (arg.startsWith('--category=')) {
      args.category = arg.slice('--category='.length).trim();
      continue;
    }

    if (arg.startsWith('--manifest=')) {
      args.manifest = path.resolve(REPO_ROOT, arg.slice('--manifest='.length));
      continue;
    }

    if (arg === '--strict-duplicates') {
      args.allowSamePhotoDuplicates = false;
      continue;
    }

    if (arg === '--no-credit') {
      args.requireCredit = false;
      continue;
    }

    if (arg === '--no-date') {
      args.requireDate = false;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function printHelp() {
  console.log(`Journalism Caption Audit

Usage:
  node scripts/audit/audit-journalism-captions.js [options]

Options:
  --category=Politics       Audit one manifest category only
  --manifest=path/to.json   Audit a non-default manifest
  --strict-duplicates       Treat duplicate captions on same photo imports as errors
  --no-credit               Do not require "(Photo by Caleb McCartney)"
  --no-date                 Do not require an AP-style date
  -h, --help                Show this help
`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function getImageSignature(event, image) {
  const match = image.filename.match(IMAGE_ID_RE);

  if (match) {
    return `${event.category}/${event.eventName}/${match[1].toUpperCase()}`;
  }

  return `${event.category}/${event.eventName}/${image.filename}`;
}

function isFallbackCaption(event, image) {
  const caption = image.caption || '';
  const description = image.description || '';

  return (
    caption === `${event.eventName} - ${event.category}` ||
    description === `${event.eventName} photography`
  );
}

function auditImage(event, image, options) {
  const issues = [];
  const caption = image.caption || '';
  const description = image.description || '';

  if (!caption.trim()) {
    issues.push('missing caption');
  }

  if (!description.trim()) {
    issues.push('missing description');
  }

  if (isFallbackCaption(event, image)) {
    issues.push('fallback metadata');
  }

  if (options.requireCredit && caption && !caption.includes('(Photo by Caleb McCartney)')) {
    issues.push('missing photo credit');
  }

  if (options.requireDate && caption && !DATE_RE.test(caption)) {
    issues.push('missing AP-style date');
  }

  if (/—/.test(caption) || /—/.test(description)) {
    issues.push('contains em dash');
  }

  if (/(,\s*Pennsylvania\b|\bin Pennsylvania\b)/.test(caption)) {
    issues.push('uses Pennsylvania instead of Pa.');
  }

  return issues;
}

function printIssueList(title, rows) {
  if (!rows.length) return;

  console.log(`\n${title}`);
  for (const row of rows.slice(0, 50)) {
    console.log(`- ${row.event}: ${row.filename}`);
    console.log(`  ${row.issue}`);
    if (row.caption) {
      console.log(`  "${row.caption}"`);
    }
  }

  if (rows.length > 50) {
    console.log(`...and ${rows.length - 50} more`);
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifest = readJson(options.manifest);
  const events = (manifest.events || []).filter((event) => {
    return !options.category || event.category === options.category;
  });

  if (options.category && events.length === 0) {
    throw new Error(`No events found for category: ${options.category}`);
  }

  let totalImages = 0;
  const issueRows = [];
  const captions = new Map();

  for (const event of events) {
    for (const image of event.images || []) {
      totalImages += 1;

      const issues = auditImage(event, image, options);
      for (const issue of issues) {
        issueRows.push({
          event: `${event.category}/${event.eventName}`,
          filename: image.filename,
          issue,
          caption: image.caption,
        });
      }

      const caption = image.caption || '';
      if (!captions.has(caption)) {
        captions.set(caption, []);
      }
      captions.get(caption).push({
        event,
        image,
        signature: getImageSignature(event, image),
      });
    }
  }

  const duplicateRows = [];
  for (const [caption, entries] of captions) {
    if (!caption || entries.length < 2) continue;

    const signatures = new Set(entries.map((entry) => entry.signature));
    if (options.allowSamePhotoDuplicates && signatures.size === 1) continue;

    duplicateRows.push({
      caption,
      count: entries.length,
      distinctPhotos: signatures.size,
      files: entries.map((entry) => `${entry.event.category}/${entry.event.eventName}/${entry.image.filename}`),
    });
  }

  const totalIssues = issueRows.length + duplicateRows.length;

  console.log('Journalism caption audit');
  console.log(`Manifest: ${path.relative(REPO_ROOT, options.manifest)}`);
  console.log(`Category: ${options.category || 'All'}`);
  console.log(`Events: ${events.length}`);
  console.log(`Images: ${totalImages}`);
  console.log(`Metadata issues: ${issueRows.length}`);
  console.log(`Duplicate caption issues: ${duplicateRows.length}`);

  printIssueList('Metadata issues', issueRows);

  if (duplicateRows.length) {
    console.log('\nDuplicate caption issues');
    for (const row of duplicateRows.slice(0, 25)) {
      console.log(`- ${row.count} files, ${row.distinctPhotos} distinct photos`);
      console.log(`  "${row.caption}"`);
      for (const file of row.files.slice(0, 8)) {
        console.log(`  ${file}`);
      }
      if (row.files.length > 8) {
        console.log(`  ...and ${row.files.length - 8} more`);
      }
    }

    if (duplicateRows.length > 25) {
      console.log(`...and ${duplicateRows.length - 25} more duplicate groups`);
    }
  }

  if (totalIssues > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
