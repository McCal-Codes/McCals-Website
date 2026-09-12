#!/usr/bin/env node

/**
 * Selected-work manifest generator.
 *
 * /featured-work is a hand-picked sequence of individual photographs, not a
 * catalogue of albums. featured-curation.json is the only input: the frames
 * listed there are the frames that appear, in the order they are listed.
 *
 * This replaces an aggregator that read the three album manifests and kept the
 * newest four per category. That version could not be curated. Its pass 1
 * filled every slot before pass 2, the only pass that read the curation file,
 * ever ran, so the curation file had no effect on the output at all. It also
 * emitted `dateDisplay: "undefined undefined"` for journalism items, because it
 * fed a `{iso, source}` date into a formatter that wanted `monthName` and
 * `year`.
 *
 * Two behaviours are deliberate:
 *
 *   A curated path that does not resolve fails the build. The old generator
 *   ended its cover lookup with `|| coverImage`, so an unmatched string was
 *   emitted verbatim and 404'd in the browser. A frame that is not on disk is a
 *   typo, and a typo should stop the build rather than reach production.
 *
 *   Every frame carries intrinsic width and height, probed with sharp. The
 *   album manifests have never recorded dimensions, and the page pairs frames
 *   side by side, so without them a portrait frame in a pair is crushed and
 *   every frame below it shifts as the images load.
 *
 * Output stays at src/images/Portfolios/featured-manifest.json under that exact
 * name: sync-manifests.js copies it by name into api/manifests/data/ and
 * public-vite/manifests/, and .github/actions/generate-manifest/action.yml
 * keys its `featured)` case to this path.
 *
 * Usage:
 *   node scripts/manifest/generate-featured-manifest.js
 *   node scripts/manifest/generate-featured-manifest.js --help
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { notify } = require('../utils/manifest-webhook');
const { writeManifestIfChanged } = require('./write-manifest.js');

const PORTFOLIOS_BASE = path.join(process.cwd(), 'src', 'images', 'Portfolios');
const OUTPUT_MANIFEST = path.join(PORTFOLIOS_BASE, 'featured-manifest.json');
const CURATION_CONFIG = path.join(__dirname, 'featured-curation.json');

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// AP style: abbreviate every month except March through July. The captions in
// the curation file already follow this, so the displayed date matches them.
const AP_MONTHS = [
  'Jan.',
  'Feb.',
  'March',
  'April',
  'May',
  'June',
  'July',
  'Aug.',
  'Sept.',
  'Oct.',
  'Nov.',
  'Dec.',
];

function log(message, ...args) {
  console.log(`⭐ ${message}`, ...args);
}

function warn(message, ...args) {
  console.warn(`⚠️  ${message}`, ...args);
}

function success(message, ...args) {
  console.log(`✅ ${message}`, ...args);
}

/**
 * "2024-10-14" -> "Oct. 14, 2024". Parsed field by field rather than through
 * `new Date()`, which reads a bare ISO date as UTC midnight and can render the
 * previous day for anyone west of Greenwich.
 */
function formatFrameDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return `${AP_MONTHS[month - 1]} ${day}, ${year}`;
}

/**
 * True only for a day that exists. The YYYY-MM-DD pattern checks shape, and
 * shape alone let "2025-13-01" through to render as "undefined 1, 2025" and
 * "2025-02-31" through as a plausible "Feb. 31, 2025": the same kind of broken
 * date display this generator was rewritten to retire. Date.UTC rolls an
 * impossible day into the next month, so a date is real exactly when it reads
 * back unchanged.
 */
function isRealCalendarDate(iso) {
  if (typeof iso !== 'string' || !ISO_DATE.test(iso)) return false;
  const [year, month, day] = iso.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

async function readCuration() {
  let raw;
  try {
    raw = await fs.readFile(CURATION_CONFIG, 'utf8');
  } catch (err) {
    throw new Error(`Cannot read the curation file at ${CURATION_CONFIG}: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`${CURATION_CONFIG} is not valid JSON: ${err.message}`);
  }

  if (!Array.isArray(parsed.frames)) {
    throw new Error(`${CURATION_CONFIG} has no "frames" array.`);
  }
  if (parsed.frames.length === 0) {
    throw new Error(`${CURATION_CONFIG} lists no frames, so /featured-work would be empty.`);
  }
  return parsed.frames;
}

/**
 * Checks every frame before reporting, so one run tells you about all of the
 * broken entries instead of stopping at the first.
 *
 * `base` is where frame paths are resolved from. It defaults to the portfolio
 * tree under the working directory; tests pass the repository's own.
 */
async function resolveFrames(curated, base = PORTFOLIOS_BASE) {
  const problems = [];
  const resolved = [];

  for (const [index, frame] of curated.entries()) {
    const at = `frames[${index}]`;

    if (typeof frame.path !== 'string' || frame.path.trim() === '') {
      problems.push(`${at} has no path.`);
      continue;
    }
    if (typeof frame.date !== 'string' || !ISO_DATE.test(frame.date)) {
      problems.push(
        `${at} (${frame.path}) needs a date as YYYY-MM-DD, got ${JSON.stringify(frame.date)}.`,
      );
      continue;
    }

    if (!isRealCalendarDate(frame.date)) {
      problems.push(`${at} (${frame.path}) has the date ${frame.date}, which is not a real day.`);
      continue;
    }

    const absolute = path.join(base, frame.path);
    let dimensions;
    try {
      const metadata = await sharp(absolute).metadata();
      dimensions = { width: metadata.width, height: metadata.height };
    } catch (err) {
      problems.push(`${at} does not resolve on disk: ${frame.path} (${err.message})`);
      continue;
    }
    if (!dimensions.width || !dimensions.height) {
      problems.push(
        `${at} (${frame.path}) reports no dimensions, so the layout cannot reserve space for it.`,
      );
      continue;
    }

    if (!frame.caption) {
      warn(`${at} (${path.basename(frame.path)}) has no caption.`);
    }

    resolved.push({
      path: frame.path,
      title: frame.title ?? '',
      caption: frame.caption ?? '',
      // Empty by default. The caption sits in the figcaption right beside the
      // photograph, and the W3C alt decision tree says to use an empty alt when
      // the image duplicates text already next to it. A per-frame alt is for
      // when the picture needs describing beyond what its caption says.
      alt: frame.alt ?? '',
      date: frame.date,
      dateDisplay: formatFrameDate(frame.date),
      category: frame.category ?? '',
      album: frame.album ?? '',
      width: dimensions.width,
      height: dimensions.height,
    });
  }

  if (problems.length > 0) {
    throw new Error(
      `${problems.length} problem${problems.length === 1 ? '' : 's'} in ${path.relative(process.cwd(), CURATION_CONFIG)}:\n  - ` +
        problems.join('\n  - '),
    );
  }
  return resolved;
}

async function generateFeaturedManifest() {
  log(`Reading ${path.relative(process.cwd(), CURATION_CONFIG)}`);
  const curated = await readCuration();
  const frames = await resolveFrames(curated);

  const manifest = {
    version: '3.0.0',
    type: 'featured',
    generated: new Date().toISOString(),
    description: 'Hand-picked single photographs for /featured-work, in page order.',
    source: path.relative(process.cwd(), CURATION_CONFIG),
    total: frames.length,
    categories: [...new Set(frames.map((frame) => frame.category).filter(Boolean))].sort(),
    dateRange: {
      oldest: frames.reduce((min, frame) => (frame.date < min ? frame.date : min), frames[0].date),
      newest: frames.reduce((max, frame) => (frame.date > max ? frame.date : max), frames[0].date),
    },
    frames,
  };

  const written = await writeManifestIfChanged(OUTPUT_MANIFEST, manifest, {
    serialize: (value) => JSON.stringify(value, null, 2) + '\n',
  });

  try {
    await notify('featured', { path: OUTPUT_MANIFEST, written });
  } catch (err) {
    console.warn('Failed to notify manifest webhook (featured):', err && err.message);
  }

  const missingCaptions = frames.filter((frame) => !frame.caption).length;
  success(
    `${frames.length} frames -> ${path.relative(process.cwd(), OUTPUT_MANIFEST)}${written ? '' : ' (unchanged)'}`,
  );
  success(
    `   ${manifest.dateRange.oldest} to ${manifest.dateRange.newest}${missingCaptions ? `, ${missingCaptions} without a caption` : ', all captioned'}`,
  );
}

// Runs only as a script, so tests can require the validation without generating
// the real manifest as a side effect.
if (require.main === module) {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
Selected-work manifest generator

  Builds src/images/Portfolios/featured-manifest.json from
  scripts/manifest/featured-curation.json.

  Every frame in the curation file appears on /featured-work, in the order it is
  listed there. Nothing else appears. Edit that file to change the page.

  Each frame is probed with sharp for its intrinsic width and height, which the
  page needs to reserve space before the image loads.

  The build fails if a curated path does not resolve on disk, or if a frame has
  no date that is a real day in YYYY-MM-DD form. A frame with no caption is a
  warning, not an error.

Usage:
  node scripts/manifest/generate-featured-manifest.js
  npm run manifest:featured
`);
    process.exit(0);
  }

  generateFeaturedManifest().catch((err) => {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  });
}

module.exports = { resolveFrames, formatFrameDate, isRealCalendarDate };
