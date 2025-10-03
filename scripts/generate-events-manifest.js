#!/usr/bin/env node

/**
 * Event Portfolio Manifest Generator
 *
 * Scans src/images/Portfolios/Events for event folders and produces
 * events-manifest.json mirroring the schema used for journalism manifests.
 */

const fs = require('fs').promises;
const path = require('path');
const { detectDateFromFilename, formatDisplayDate, createFallbackDate } = require('./shared-date-parsing.js');

const EVENTS_DIR = path.join(__dirname, '../src/images/Portfolios/Events');
const MANIFEST_PATH = path.join(EVENTS_DIR, 'events-manifest.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function cleanTitle(name) {
  return name
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

// Date parsing functions moved to shared-date-parsing.js module

async function ensureEventsDirExists() {
  try {
    await fs.access(EVENTS_DIR);
  } catch (error) {
    throw new Error(`Events directory not found: ${EVENTS_DIR}`);
  }
}

async function collectEventData() {
  const entries = await fs.readdir(EVENTS_DIR, { withFileTypes: true });
  const events = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const eventFolder = entry.name;
    const eventDir = path.join(EVENTS_DIR, eventFolder);
    const files = await fs.readdir(eventDir);
    const imageFiles = files.filter(isImageFile).sort();

    if (imageFiles.length === 0) {
      // Skip empty folders to keep manifest clean
      continue;
    }

    const eventName = cleanTitle(eventFolder);
    let eventDateIso = null;
    let eventDateSource = null;

    for (const filename of imageFiles) {
      const dateResult = detectDateFromFilename(filename);
      if (dateResult) {
        eventDateIso = dateResult.iso;
        eventDateSource = 'filename_extraction';
        break;
      }
    }

    if (!eventDateIso) {
      const fallbackDate = createFallbackDate();
      eventDateIso = fallbackDate.iso;
      eventDateSource = 'fallback_current_date';
    }

    const images = imageFiles.map(filename => ({
      filename,
      path: `${eventFolder}/${filename}`,
      description: `${eventName} photography`,
      caption: `${eventName}`,
      tags: ['Events']
    }));

    events.push({
      eventName,
      category: 'Events',
      tags: ['Events'],
      folderPath: eventFolder,
      eventDate: {
        iso: eventDateIso,
        source: eventDateSource
      },
      dateDisplay: formatDisplayDate(eventDateIso),
      totalImages: images.length,
      images,
      published: false,
      metadata: {}
    });
  }

  // Sort events newest first by date
  events.sort((a, b) => (a.eventDate.iso < b.eventDate.iso ? 1 : -1));
  return events;
}

async function buildManifest(events) {
  const totalImages = events.reduce((sum, event) => sum + event.totalImages, 0);

  return {
    version: '2.0',
    generated: new Date().toISOString(),
    totalEvents: events.length,
    totalImages,
    events
  };
}

async function writeManifest(manifest) {
  const content = `${JSON.stringify(manifest, null, 2)}\n`;
  await fs.writeFile(MANIFEST_PATH, content, 'utf-8');
}

async function main() {
  try {
    await ensureEventsDirExists();
    const events = await collectEventData();
    const manifest = await buildManifest(events);
    await writeManifest(manifest);
    console.log(`✅ Generated ${manifest.totalEvents} events with ${manifest.totalImages} images`);
  } catch (error) {
    console.error('❌ Failed to generate events manifest:', error.message);
    process.exitCode = 1;
  }
}

main();
