#!/usr/bin/env node
/**
 * Embeds IPTC/XMP rights metadata into the portfolio photographs, and AP-style
 * caption metadata into the journalism images that have it.
 *
 * Why this exists: the published photographs carried no copyright, creator, credit
 * or rights statement at all, and `scripts/optimize-images.js` was stripping
 * whatever the originals had. Embedded metadata is the only attribution that
 * survives an image being copied off the site, and Google reads it to show the
 * "Licensable" badge in Google Images.
 *
 * Caption data is only written where it genuinely exists. The journalism manifest
 * carries real AP-style captions per image; the other portfolios do not, and
 * inventing captions for them would put false statements in the files.
 *
 * Requires `exiftool` on PATH — sharp cannot write IPTC, it exposes those blocks as
 * opaque buffers. Install with `brew install exiftool` or `apt install libimage-exiftool-perl`.
 *
 *   node scripts/metadata/embed-image-rights.js                      # report only
 *   node scripts/metadata/embed-image-rights.js --only=Journalism   # scope to one portfolio
 *   node scripts/metadata/embed-image-rights.js --only=Journalism --write
 *   node scripts/metadata/embed-image-rights.js --write --force     # restamp everything
 *
 * Scoping matters here. These images are committed to the repository with no Git LFS,
 * so stamping a portfolio rewrites every blob in it and adds that much to history
 * permanently — roughly 1.1 GB for all five, against a 2.4 GB .git. Do one portfolio,
 * confirm the metadata survives optimization and the CDN, then continue.
 */

import { execFileSync, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { baseRightsTags, CREATOR, WEB_STATEMENT } from './image-rights-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PORTFOLIO_DIR = path.join(REPO_ROOT, 'src', 'images', 'Portfolios');
const JOURNALISM_MANIFEST = path.join(
  REPO_ROOT,
  'sites',
  'mcc-cal-vite',
  'public-vite',
  'manifests',
  'journalism-manifest.json',
);

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const argv = process.argv.slice(2);
const args = new Set(argv);
const WRITE = args.has('--write');
const FORCE = args.has('--force');
const ONLY = argv.find((arg) => arg.startsWith('--only='))?.slice('--only='.length) ?? null;

function fail(message) {
  console.error(`\n${message}\n`);
  process.exit(1);
}

function requireExiftool() {
  const probe = spawnSync('exiftool', ['-ver'], { encoding: 'utf8' });
  if (probe.error || probe.status !== 0) {
    fail(
      'exiftool is required and was not found on PATH.\n' +
        '  macOS:  brew install exiftool\n' +
        '  Debian: sudo apt install libimage-exiftool-perl',
    );
  }
  return probe.stdout.trim();
}

function walkImages(dir) {
  const found = [];
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkImages(full));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      found.push(full);
    }
  }
  return found;
}

/**
 * Maps image filename to its caption data from the journalism manifest.
 *
 * Keyed on basename because the manifest stores paths relative to each event folder
 * while this script walks absolute paths.
 *
 * A handful of basenames match more than one file — 15 photographs from the same
 * shoot are filed under both Events and Journalism. Those pairs are byte-identical,
 * so applying the same caption to both is correct rather than a mismatch.
 */
function loadJournalismCaptions() {
  if (!fs.existsSync(JOURNALISM_MANIFEST)) {
    console.warn('Journalism manifest not found; rights fields only.');
    return new Map();
  }

  const manifest = JSON.parse(fs.readFileSync(JOURNALISM_MANIFEST, 'utf8'));
  const byFilename = new Map();

  for (const event of manifest.events ?? []) {
    for (const image of event.images ?? []) {
      const filename = path.basename(image.filename || image.path || '');
      if (!filename) continue;

      byFilename.set(filename, {
        // `description` is the caption without the trailing credit; that belongs in
        // the Credit field, not repeated inside the description.
        description: image.description || null,
        headline: event.eventName || null,
        dateCreated: event.eventDate?.iso || event.metadata?.date || null,
        source: event.outlet || null,
        keywords: [...(image.tags ?? []), ...(event.tags ?? [])],
      });
    }
  }

  return byFilename;
}

/** exiftool wants `YYYY:MM:DD HH:MM:SS`, not ISO. */
function toExifDate(iso) {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return match ? `${match[1]}:${match[2]}:${match[3]} 00:00:00` : null;
}

function tagsForImage(file, captions) {
  const tags = baseRightsTags();
  const caption = captions.get(path.basename(file));
  if (!caption) return tags;

  if (caption.description) {
    tags['XMP-dc:Description'] = caption.description;
    tags['IPTC:Caption-Abstract'] = caption.description;
  }
  if (caption.headline) {
    tags['XMP-photoshop:Headline'] = caption.headline;
    tags['IPTC:Headline'] = caption.headline;
  }
  const date = toExifDate(caption.dateCreated);
  if (date) {
    tags['XMP-photoshop:DateCreated'] = date;
  }
  if (caption.source) {
    // Where the work was first published. Distinct from Credit, which is who to
    // credit on reuse.
    tags['XMP-photoshop:Source'] = caption.source;
    tags['IPTC:Source'] = caption.source;
  }
  const keywords = [...new Set(caption.keywords)].filter(Boolean);
  if (keywords.length) {
    tags['XMP-dc:Subject'] = keywords.join(', ');
    tags['IPTC:Keywords'] = keywords.join(', ');
  }

  return tags;
}

/**
 * Finds files whose extension disagrees with their actual format — a JPEG named
 * `.png`, for example.
 *
 * exiftool refuses to write these, because doing so would produce a file that is
 * invalid for its own extension. Browsers sniff content and render them fine, which
 * is why they go unnoticed, but they also get served with the wrong Content-Type.
 * Reporting them by name is more useful than letting exiftool fail 500 lines deep.
 */
/**
 * Reduces exiftool's FileType values and file extensions to a common vocabulary.
 *
 * `Extended WEBP` is a normal .webp carrying a VP8X chunk — which is precisely what
 * writing XMP into a WebP produces, so treating it as a mismatch would flag every
 * file this script had already stamped.
 */
function normaliseFormat(value) {
  const format = String(value).trim().toLowerCase();
  if (format === 'jpg') return 'jpeg';
  if (format.endsWith('webp')) return 'webp';
  return format;
}

function findMislabelled(files) {
  const mismatched = [];
  const BATCH = 400;
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const out = execFileSync('exiftool', ['-m', '-q', '-q', '-s3', '-filepath', '-FileType', ...batch], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    const lines = out.split('\n').filter(Boolean);
    for (let j = 0; j + 1 < lines.length; j += 2) {
      const file = lines[j];
      const actual = normaliseFormat(lines[j + 1]);
      const claimed = normaliseFormat(path.extname(file).slice(1));
      if (actual && claimed && actual !== claimed) {
        mismatched.push({ file, claimed, actual: lines[j + 1] });
      }
    }
  }
  return mismatched;
}

/**
 * Files already carrying our Web Statement are skipped, so this can run in a
 * scheduled workflow without rewriting thousands of binaries on every pass.
 */
function alreadyStamped(files) {
  if (FORCE || files.length === 0) return new Set();

  const stamped = new Set();
  const BATCH = 400;
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    const out = execFileSync(
      'exiftool',
      ['-m', '-q', '-q', '-s3', '-filepath', '-XMP-xmpRights:WebStatement', ...batch],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
    );
    // -s3 prints bare values; a stamped file yields two lines, an unstamped one line.
    const lines = out.split('\n');
    for (let j = 0; j < lines.length - 1; j += 1) {
      if (lines[j + 1] === WEB_STATEMENT) {
        stamped.add(lines[j]);
        j += 1;
      }
    }
  }
  return stamped;
}

function buildArgFile(work) {
  const lines = [];
  for (const { file, tags } of work) {
    for (const [tag, value] of Object.entries(tags)) {
      lines.push(`-${tag}=${value}`);
    }
    lines.push(file);
    lines.push('-execute');
  }
  return lines.join('\n');
}

// ── run ──────────────────────────────────────────────────────────────────────

const version = requireExiftool();
const captions = loadJournalismCaptions();

const scopeDir = ONLY ? path.join(PORTFOLIO_DIR, ONLY) : PORTFOLIO_DIR;
if (ONLY && !fs.existsSync(scopeDir)) {
  const available = fs
    .readdirSync(PORTFOLIO_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  fail(`No portfolio named "${ONLY}". Available: ${available.join(', ')}`);
}

const files = walkImages(scopeDir);

if (files.length === 0) {
  fail(`No images found under ${path.relative(REPO_ROOT, scopeDir)}.`);
}

if (ONLY) console.log(`Scope: ${ONLY} only`);

const mislabelled = findMislabelled(files);
const skipped = new Set(mislabelled.map((entry) => entry.file));

const stamped = alreadyStamped(files);
const pending = files.filter((file) => !stamped.has(file) && !skipped.has(file));
const work = pending.map((file) => ({ file, tags: tagsForImage(file, captions) }));
const withCaption = work.filter(({ tags }) => 'XMP-dc:Description' in tags).length;

console.log(`exiftool ${version}`);
console.log(`Images found:        ${files.length}`);
console.log(`Already stamped:     ${stamped.size}`);
console.log(`To stamp:            ${pending.length}`);
console.log(`  with AP caption:   ${withCaption}`);
console.log(`  rights fields only:${pending.length - withCaption}`);

if (mislabelled.length > 0) {
  console.warn(`\nSkipped ${mislabelled.length} file(s) whose extension does not match their format.`);
  console.warn('exiftool cannot write these without producing a file invalid for its own extension.');
  console.warn('Rename each to its real format and regenerate the manifests to fix:');
  for (const { file, claimed, actual } of mislabelled) {
    console.warn(`  ${path.relative(REPO_ROOT, file)}  (.${claimed} but is ${actual})`);
  }
}

if (pending.length === 0) {
  console.log('\nNothing to do.');
  process.exit(0);
}

if (!WRITE) {
  console.log('\nReport only — nothing written. Re-run with --write to embed.');
  console.log('Sample of what would be written:');
  const [sample] = work;
  for (const [tag, value] of Object.entries(sample.tags)) {
    console.log(`  ${tag.padEnd(34)} ${String(value).slice(0, 88)}`);
  }
  process.exit(0);
}

const argFile = path.join(os.tmpdir(), `mcc-image-rights-${process.pid}.args`);
fs.writeFileSync(argFile, buildArgFile(work), 'utf8');

try {
  const result = spawnSync(
    'exiftool',
    ['-@', argFile, '-common_args', '-overwrite_original', '-codedcharacterset=utf8', '-m'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024 },
  );

  const updated = (result.stdout.match(/1 image files updated/g) ?? []).length;
  console.log(`\nUpdated ${updated} of ${pending.length} images.`);

  if (result.status !== 0 || updated < pending.length) {
    const detail = (result.stderr || '').trim().split('\n').slice(0, 5).join('\n');
    if (detail) console.error(`\nexiftool reported:\n${detail}`);
    if (updated === 0) fail('No images were updated.');
  }

  console.log(`Creator: ${CREATOR} · rights: ${WEB_STATEMENT}`);
} finally {
  fs.rmSync(argFile, { force: true });
}
