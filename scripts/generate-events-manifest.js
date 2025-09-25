#!/usr/bin/env node

/**
 * Event Portfolio Manifest Generator
 *
 * Scans src/images/Portfolios/Events for event folders and produces
 * events-manifest.json mirroring the schema used for journalism manifests.
 */

const fs = require('fs').promises;
const path = require('path');

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

function extractDateFromFilename(filename) {
  const patterns = [
    /(\d{6})_/, // 241105_EventName_
    /(\d{6})-/, // 241105-EventName-
    /^(\d{6})/ // 241105EventName
  ];

  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (!match) continue;

    const value = match[1];
    const year = 2000 + parseInt(value.substring(0, 2), 10);
    const month = parseInt(value.substring(2, 4), 10);
    const day = parseInt(value.substring(4, 6), 10);

    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
      return date.toISOString().split('T')[0];
    }
  }

  return null;
}

function formatDisplayDate(iso) {
  if (!iso) return 'Date TBD';
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

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
      const extracted = extractDateFromFilename(filename);
      if (extracted) {
        eventDateIso = extracted;
        eventDateSource = 'filename_extraction';
        break;
      }
    }

    if (!eventDateIso) {
      eventDateIso = new Date().toISOString().split('T')[0];
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
