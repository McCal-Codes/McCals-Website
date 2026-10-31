#!/usr/bin/env node

/**
 * One-time cleanup: removes duplicate image entries from the journalism
 * manifest that were catalogued twice under different filename conventions
 * (e.g. the same CAL#### frame exported as both a differently-named jpg and
 * a webp). Uses the frame-number-aware dedupeImageEntries fix in
 * scripts/utils/image-manifest-dedupe.js.
 *
 * Usage: node scripts/audit/dedupe-journalism-manifest.js
 */

const fs = require('fs');
const path = require('path');
const { dedupeImageEntries } = require('../utils/image-manifest-dedupe.js');

// src/images/Portfolios/Journalism/journalism-manifest.json is the master —
// scripts/sync-manifests.js does a byte-for-byte copy of it into both
// api/manifests/data/ (read first by the deployed /api/manifests/[type]
// function) and public-vite/manifests/ (its fallback) on every build. Fixing
// only the copies is pointless: the next build's prebuild sync overwrites
// them from the still-broken master. Dedupe the master, then mirror it.
const MASTER_PATH = path.resolve(
  __dirname,
  '../../src/images/Portfolios/Journalism/journalism-manifest.json',
);
const MIRROR_PATHS = [
  path.resolve(__dirname, '../../sites/mcc-cal-vite/api/manifests/data/journalism-manifest.json'),
  path.resolve(__dirname, '../../sites/mcc-cal-vite/public-vite/manifests/journalism-manifest.json'),
];

function dedupeManifest(manifest) {
  let removedTotal = 0;

  for (const event of manifest.events) {
    const before = event.images.length;
    event.images = dedupeImageEntries(event.images);
    const removed = before - event.images.length;

    if (removed > 0) {
      console.log(`  ${event.eventName}: ${before} -> ${event.images.length} images (-${removed})`);
    }

    event.totalImages = event.images.length;
    removedTotal += removed;
  }

  manifest.totalImages = manifest.events.reduce((sum, e) => sum + e.images.length, 0);
  return removedTotal;
}

function main() {
  console.log(`Deduping master: ${MASTER_PATH}`);
  const manifest = JSON.parse(fs.readFileSync(MASTER_PATH, 'utf8'));
  const removedTotal = dedupeManifest(manifest);
  const output = `${JSON.stringify(manifest, null, 2)}\n`;

  fs.writeFileSync(MASTER_PATH, output);
  console.log(`  Removed ${removedTotal} duplicate entries. totalImages: ${manifest.totalImages}\n`);

  for (const mirrorPath of MIRROR_PATHS) {
    if (!fs.existsSync(mirrorPath)) {
      console.log(`Skipping mirror (not found): ${mirrorPath}`);
      continue;
    }
    fs.writeFileSync(mirrorPath, output);
    console.log(`Mirrored to: ${mirrorPath}`);
  }
}

main();
