#!/usr/bin/env node
/**
 * Add Cleveland Browns Album to Portfolio Manifest
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function updateManifest() {
  const manifestPath = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\portfolio-manifest.json';
  const albumPath = join(__dirname, '..', '..', 'updates', 'cleveland-browns-tailgate-album.json');
  
  // Load files
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
  const album = JSON.parse(await fs.readFile(albumPath, 'utf-8'));
  
  // Create new manifest entry
  const newEntry = {
    type: 'Events',
    category: 'Event Photography',
    name: 'Cleveland Browns at Pittsburgh Tailgate',
    folderPath: 'Events/Cleveland Browns at Pittsburgh Tailgate',
    dateDisplay: album.dateDisplay,
    date: album.date,
    totalImages: album.totalImages,
    images: album.images,
    coverImage: album.coverImage
  };
  
  // Find where to insert (after last Events entry or at end)
  let insertIndex = manifest.items.length;
  for (let i = 0; i < manifest.items.length; i++) {
    if (manifest.items[i].type === 'Events') {
      insertIndex = i + 1;
    }
  }
  
  // Insert the new entry
  manifest.items.splice(insertIndex, 0, newEntry);
  
  // Update counts
  manifest.totalItems = manifest.items.length;
  manifest.totalImages += album.totalImages;
  manifest.portfolioSummary.Events.count += 1;
  manifest.portfolioSummary.Events.totalImages += album.totalImages;
  
  // Update version and timestamp
  manifest.version = '1.1.0';
  manifest.generated = new Date().toISOString();
  
  // Save updated manifest
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log('✅ Updated portfolio-manifest.json');
  console.log(`   Added: ${newEntry.name}`);
  console.log(`   Total items: ${manifest.totalItems}`);
  console.log(`   Total images: ${manifest.totalImages}`);
  console.log(`   Events count: ${manifest.portfolioSummary.Events.count}`);
}

updateManifest().catch(console.error);
