#!/usr/bin/env node
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

// Import shared date parsing utilities
const { detectDateFromFilename } = require('../utils/shared-date-parsing.js');
const { resolveDateOverride } = require('../utils/date-overrides.js');
const { notify } = require('../utils/manifest-webhook');
const { IMAGE_EXTENSION_RE, dedupeImageEntries } = require('../utils/image-manifest-dedupe.js');

// NOTE: Adjusted to include leading 'src/' so default matches repo structure
const DEFAULT_ROOT = 'src/images/Portfolios/Events';
const OUTPUT_FILE = 'events-manifest.json';

// TODO: Dynamic manifest versioning improvement
// Future enhancement: derive version from highest widget HTML version in
// src/widgets/event-portfolio/versions/ OR from a central version registry.
// For now we support an override via --version CLI flag or EVENTS_MANIFEST_VERSION env var.

function titleCase(slug) {
  return slug
    .replace(/[_-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Enhanced date parsing that uses shared date parsing utilities
 * Looks for dates in filenames first, then folder names, then falls back to current date
 */
function parseEventDate(folderName, imageFiles = []) {
  // First try to extract date from the first image filename (most accurate)
  for (const fileName of imageFiles) {
    const dateInfo = detectDateFromFilename(fileName);
    if (dateInfo) {
      return {
        year: dateInfo.year,
        month: dateInfo.month,
        day: dateInfo.day,
        iso: dateInfo.iso,
        monthName: dateInfo.monthName,
        display: `${dateInfo.monthName} ${dateInfo.year}`,
        source: `filename:${fileName}`,
        confidence: 'high',
      };
    }
  }

  // Try to extract date from folder name
  const folderDateInfo = detectDateFromFilename(folderName);
  if (folderDateInfo) {
    return {
      year: folderDateInfo.year,
      month: folderDateInfo.month,
      day: folderDateInfo.day,
      iso: folderDateInfo.iso,
      monthName: folderDateInfo.monthName,
      display: `${folderDateInfo.monthName} ${folderDateInfo.year}`,
      source: `folder:${folderName}`,
      confidence: 'medium',
    };
  }

  // Fallback to current date
  const now = new Date();
  const monthName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ][now.getMonth()];

  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    iso: now.toISOString().slice(0, 10),
    monthName: monthName,
    display: `${monthName} ${now.getFullYear()}`,
    source: 'fallback:current',
    confidence: 'low',
  };
}

async function readDirSafe(dir) {
  try {
    return await fsp.readdir(dir);
  } catch {
    return [];
  }
}

function deriveCategory(dir) {
  const slug = dir.toLowerCase();

  // Theatre - staged productions and theatre-tagged coverage
  if (
    /(love.*s.*a.*game|guy.*hates.*musicals|ghostlight|theatre|theater|musical|growing\s*up)/i.test(
      dir,
    )
  )
    return 'Theatre';

  // Journalism - documentary/event coverage that should surface as journalism
  if (/(drag.*carnegie|drag\s+at\s+carnegie)/i.test(dir)) return 'Journalism';

  // Events - broad social/community event coverage
  if (/back\s*to\s*school\s*bash/i.test(dir)) return 'Event';

  // Performance Art - non-theatre performance events
  if (/howl.*at.*the.*moon/i.test(dir)) return 'Performance Art';

  // General - catch-all for community/outdoor activities like hikes
  if (
    /(hike|hiking|meet\s*hike|outdoor|trail|walk)/i.test(slug) ||
    /yinzers\s*meet\s*hike/i.test(dir)
  )
    return 'General';

  // Corporate events (including business parties/receptions)
  if (
    /(james.*bond.*cocktail|cocktail.*party|inclusivity|workplace|myron.*cope|franks.*script|dance.*for.*a.*cause|pennsylvania.*media.*awards|robotics|denver)/i.test(
      dir,
    )
  )
    return 'Corporate';

  // Dance - dance-specific venues and recitals
  if (/(the\s*space\s*upstairs|dance\s*recital|fayette.*dance|psf.*dance)/i.test(dir))
    return 'Dance';

  // Graduation - commencement and graduation coverage
  if (/(graduation|commencement|grad)/i.test(slug)) return 'Graduation';

  // Celebration - personal celebrations
  if (/(gala|celebration|festival|wedding)/i.test(slug)) return 'Celebration';

  // Conference - professional conferences and summits
  if (/(conference|summit|forum|symposium|local.*union|officers)/i.test(slug)) return 'Conference';

  // Published - media and press events
  if (/(published|press|feature|media|pennsylvania.*media|awards)/i.test(slug)) return 'Published';

  // On-Location
  if (/(on-location|location|travel|tour)/.test(slug)) return 'On-Location';

  return 'Corporate';
}

async function exists(target) {
  try {
    await fsp.access(target, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function loadEventMetadata(eventDir) {
  const metadataPath = path.join(eventDir, 'tags.json');

  if (!(await exists(metadataPath))) {
    return null;
  }

  try {
    const content = await fsp.readFile(metadataPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(
      '[WARN] Invalid event tags metadata: - generate-events-manifest.js',
      path.relative(process.cwd(), metadataPath),
      error && error.message,
    );
    return null;
  }
}

function normaliseTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(
      tags
        .map((tag) => String(tag).trim())
        .filter(Boolean),
    ),
  ];
}

async function main() {
  const argv = process.argv.slice(2);
  const rootFlag = argv.indexOf('--root');
  const versionFlag = argv.indexOf('--version');
  const requestedVersion =
    versionFlag >= 0 && argv[versionFlag + 1]
      ? String(argv[versionFlag + 1]).trim()
      : (process.env.EVENTS_MANIFEST_VERSION || '').trim();
  const manifestVersion = requestedVersion || '2.6.4';
  const rootDir = rootFlag >= 0 && argv[rootFlag + 1] ? argv[rootFlag + 1] : DEFAULT_ROOT;
  const absRoot = path.resolve(rootDir);
  const portfoliosBase = path.join(process.cwd(), 'src', 'images', 'Portfolios');
  const relativeRoot = path.relative(portfoliosBase, absRoot).replace(/\\\\/g, '/');

  if (!(await exists(absRoot))) {
    console.error('[ERR] Events root not found: - generate-events-manifest.js:124', absRoot);
    process.exit(1);
  }

  const entries = await fsp.readdir(absRoot, { withFileTypes: true });
  const dirs = entries
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const events = [];
  for (const dir of dirs) {
    const files = dedupeImageEntries(
      (await readDirSafe(path.join(absRoot, dir))).filter((f) => IMAGE_EXTENSION_RE.test(f)),
    );
    if (!files.length) continue;

    const eventName = titleCase(dir);
    const metadata = await loadEventMetadata(path.join(absRoot, dir));
    const folderSegments = [];
    if (relativeRoot && relativeRoot !== '' && relativeRoot !== '.') {
      folderSegments.push(relativeRoot);
    }
    folderSegments.push(dir);
    const folderKey = folderSegments.join('/');

    let dateInfo = parseEventDate(dir, files);
    const override = resolveDateOverride([folderKey, eventName, dir]);

    if (override) {
      dateInfo = {
        ...dateInfo,
        ...override.date,
      };
    }

    const images = files.map((file) => ({
      path: path.posix.join(rootDir.replace(/^.*?src\//, 'src/'), dir, file),
    }));

    const dateDisplay = override ? override.dateDisplay : dateInfo.display;
    const dateSource = override ? override.dateSource : dateInfo.source;
    const dateConfidence = override ? override.dateConfidence : dateInfo.confidence;

    const category =
      typeof metadata?.category === 'string' && metadata.category.trim()
        ? metadata.category.trim()
        : deriveCategory(dir);
    const tags = normaliseTags([category, ...normaliseTags(metadata?.tags)]);

    const eventEntry = {
      eventName,
      category,
      tags,
      dateDisplay,
      dateISO: dateInfo.iso,
      date: {
        year: dateInfo.year,
        month: dateInfo.month,
        day: dateInfo.day,
        monthName: dateInfo.monthName,
        iso: dateInfo.iso,
        display: dateDisplay,
      },
      dateSource: dateSource,
      dateConfidence: dateConfidence,
      images,
      totalImages: images.length,
    };

    if (override && override.notes) {
      eventEntry.dateNotes = override.notes;
    }

    events.push(eventEntry);
  }

  // Sort by ISO date (most accurate) then by dateDisplay as fallback
  events.sort((a, b) => {
    const aDate = new Date(a.dateISO);
    const bDate = new Date(b.dateISO);
    if (!isNaN(aDate) && !isNaN(bDate)) {
      return bDate.getTime() - aDate.getTime();
    }
    // Fallback to string comparison of dateDisplay
    return (b.dateDisplay || '').localeCompare(a.dateDisplay || '');
  });

  const generatedAt = new Date().toISOString();
  const manifest = {
    version: manifestVersion,
    generated: generatedAt,
    generatedBy: 'events-manifest-generator',
    totalEvents: events.length,
    events,
    // Provide a generic alias so generic-consuming widgets can read .items
    items: events.map((e) => ({
      title: e.eventName,
      eventName: e.eventName,
      category: e.category,
      tags: e.tags,
      dateDisplay: e.dateDisplay,
      dateISO: e.dateISO,
      date: e.date,
      images: e.images,
      // Provide a folderPath derived from first image path if possible
      folderPath:
        e.images && e.images[0] && e.images[0].path
          ? e.images[0].path
              .replace(/^src\/images\/Portfolios\//, '')
              .split('/')
              .slice(0, -1)
              .join('/')
          : '',
    })),
  };

  const outFile = path.join(absRoot, OUTPUT_FILE);
  const tmpFile = outFile + '.tmp';
  const content = JSON.stringify(manifest, null, 2) + '\n';

  // Atomic write: write to temp file then rename
  await fsp.writeFile(tmpFile, content, 'utf8');
  await fsp.rename(tmpFile, outFile);
  console.log(
    '[OK] Wrote manifest (v' + manifestVersion + '): - generate-events-manifest.js:225',
    path.relative(process.cwd(), outFile),
  );
  const canonicalRoot = path.resolve(DEFAULT_ROOT);
  const shouldNotify =
    absRoot === canonicalRoot || String(process.env.MANIFEST_WEBHOOK_ALWAYS).toLowerCase() === 'true';
  if (shouldNotify) {
    try {
      await notify('events', {
        path: outFile,
        written: true,
        generatedAt,
        totalEvents: manifest.totalEvents,
      });
    } catch (err) {
      console.warn('Failed to notify manifest webhook (events):', err && err.message);
    }
  }
}

main().catch((err) => {
  console.error('[ERR] - generate-events-manifest.js:229', (err && err.stack) || err);
  process.exit(1);
});
