#!/usr/bin/env node
/**
 * Validate portfolio manifests for duplicate IDs
 * Run this before builds to catch React key conflicts early
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(process.cwd(), 'src', 'images', 'Portfolios');

function generateId(title, suffix) {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  if (!suffix) return base;
  const suffixPart = String(suffix).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `${base}-${suffixPart}`.replace(/^-|-$/g, '');
}

function checkConcertManifest() {
  const file = path.join(BASE_DIR, 'Concert', 'concert-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  const ids = {};
  data.bands.forEach((band, idx) => {
    const id = generateId(band.bandName, band.concertDate?.iso);
    if (!ids[id]) ids[id] = [];
    ids[id].push({ index: idx, name: band.bandName, folder: band.folderPath });
  });
  
  const dups = Object.entries(ids).filter(([_, items]) => items.length > 1);
  return dups.map(([id, items]) => ({ manifest: 'Concert', id, items }));
}

function checkEventsManifest() {
  const file = path.join(BASE_DIR, 'Events', 'events-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  const ids = {};
  data.events.forEach((evt, idx) => {
    const id = generateId(evt.eventName, evt.eventDate?.iso || evt.dateISO);
    if (!ids[id]) ids[id] = [];
    ids[id].push({ index: idx, name: evt.eventName, folder: evt.folderPath });
  });
  
  const dups = Object.entries(ids).filter(([_, items]) => items.length > 1);
  return dups.map(([id, items]) => ({ manifest: 'Events', id, items }));
}

function checkJournalismManifest() {
  const file = path.join(BASE_DIR, 'Journalism', 'journalism-manifest.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  
  const ids = {};
  data.events.forEach((evt, idx) => {
    const id = generateId(evt.eventName, evt.eventDate?.iso);
    if (!ids[id]) ids[id] = [];
    ids[id].push({ index: idx, name: evt.eventName, folder: evt.folderPath });
  });
  
  const dups = Object.entries(ids).filter(([_, items]) => items.length > 1);
  return dups.map(([id, items]) => ({ manifest: 'Journalism', id, items }));
}

function main() {
  console.log('🔍 Validating portfolio manifests for duplicate IDs...\n');
  
  const allDups = [
    ...checkConcertManifest(),
    ...checkEventsManifest(),
    ...checkJournalismManifest(),
  ];
  
  if (allDups.length === 0) {
    console.log('✅ No duplicate IDs found');
    process.exit(0);
  }
  
  console.log(`❌ Found ${allDups.length} duplicate ID(s):\n`);
  allDups.forEach(({ manifest, id, items }) => {
    console.log(`${manifest} - ID: "${id}"`);
    items.forEach(item => {
      console.log(`  [${item.index}] ${item.name} (${item.folder})`);
    });
    console.log('');
  });
  
  process.exit(1);
}

main();
