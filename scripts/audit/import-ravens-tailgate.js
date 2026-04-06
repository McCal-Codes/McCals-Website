#!/usr/bin/env node
/**
 * Import Ravens at Pittsburgh Tailgate (filtered for web-ready photos only)
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function importRavens() {
  const auditPath = join(__dirname, '..', '..', 'updates', 'terrible-tailgate-separate-albums.json');
  const audit = JSON.parse(await fs.readFile(auditPath, 'utf-8'));
  
  const ravens = audit.albums.find(a => a.name.includes('Ravens'));
  
  console.log('🟡 RAVENS AT PITTSBURGH TAILGATE - FILTERED IMPORT');
  console.log('═'.repeat(70));
  
  // Filter for web-ready photos (< 1MB)
  const webReadyPhotos = ravens.sourceFiles.filter(p => parseFloat(p.sizeMB) < 1);
  const largePhotos = ravens.sourceFiles.filter(p => parseFloat(p.sizeMB) >= 1);
  
  console.log(`Original total: ${ravens.totalImages} photos (${ravens.totalSizeMB} MB)`);
  console.log(`Web-ready (< 1MB): ${webReadyPhotos.length} photos`);
  console.log(`Filtered out (>= 1MB): ${largePhotos.length} photos`);
  console.log('');
  
  // Create folder
  const targetDir = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\Events\\Ravens at Pittsburgh Tailgate';
  await fs.mkdir(targetDir, { recursive: true });
  
  // Sort by filename
  webReadyPhotos.sort((a, b) => {
    const numA = a.filename.match(/CAL(\d+)/)?.[1] || 0;
    const numB = b.filename.match(/CAL(\d+)/)?.[1] || 0;
    return parseInt(numA) - parseInt(numB);
  });
  
  // Pick cover (mid-sequence)
  const coverIndex = Math.floor(webReadyPhotos.length / 3);
  const coverImage = webReadyPhotos[coverIndex]?.filename;
  
  // Copy photos
  console.log('Copying photos...');
  let copied = 0;
  let failed = 0;
  
  for (const photo of webReadyPhotos) {
    const targetPath = join(targetDir, photo.filename);
    try {
      await copyFile(photo.sourcePath, targetPath);
      copied++;
      process.stdout.write('.');
    } catch {
      failed++;
      process.stdout.write('x');
    }
  }
  
  console.log('\n');
  console.log(`✅ Copied: ${copied} photos`);
  console.log(`❌ Failed: ${failed} photos`);
  console.log('');
  
  // Create manifest entry
  const manifestEntry = {
    type: 'Events',
    category: 'Event Photography',
    name: 'Ravens at Pittsburgh Tailgate',
    folderPath: 'Events/Ravens at Pittsburgh Tailgate',
    dateDisplay: ravens.dateDisplay,
    date: ravens.date,
    client: 'Terrible Tailgate',
    opponent: 'Baltimore Ravens',
    totalImages: webReadyPhotos.length,
    totalSizeMB: webReadyPhotos.reduce((s, p) => s + parseFloat(p.sizeMB), 0).toFixed(2),
    avgSizeMB: (webReadyPhotos.reduce((s, p) => s + parseFloat(p.sizeMB), 0) / webReadyPhotos.length).toFixed(2),
    coverImage,
    images: webReadyPhotos.map(p => p.filename),
    note: `Filtered from ${ravens.totalImages} total - excluded ${largePhotos.length} large files (>= 1MB)`
  };
  
  // Save album manifest
  const albumManifestPath = join(targetDir, 'album-manifest.json');
  await fs.writeFile(albumManifestPath, JSON.stringify(manifestEntry, null, 2));
  
  // Update main portfolio manifest
  const mainManifestPath = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\portfolio-manifest.json';
  const mainManifest = JSON.parse(await fs.readFile(mainManifestPath, 'utf-8'));
  
  // Insert after last Events entry
  let insertIndex = mainManifest.items.length;
  for (let i = 0; i < mainManifest.items.length; i++) {
    if (mainManifest.items[i].type === 'Events') {
      insertIndex = i + 1;
    }
  }
  
  mainManifest.items.splice(insertIndex, 0, manifestEntry);
  mainManifest.totalItems = mainManifest.items.length;
  mainManifest.totalImages += webReadyPhotos.length;
  mainManifest.portfolioSummary.Events.count += 1;
  mainManifest.portfolioSummary.Events.totalImages += webReadyPhotos.length;
  mainManifest.version = '1.2.0';
  mainManifest.generated = new Date().toISOString();
  
  await fs.writeFile(mainManifestPath, JSON.stringify(mainManifest, null, 2));
  
  console.log('═'.repeat(70));
  console.log('IMPORT COMPLETE');
  console.log('═'.repeat(70));
  console.log(`Album: ${manifestEntry.name}`);
  console.log(`Photos: ${manifestEntry.totalImages} (${manifestEntry.totalSizeMB} MB)`);
  console.log(`Cover: ${manifestEntry.coverImage}`);
  console.log(`Folder: ${manifestEntry.folderPath}`);
  console.log('');
  console.log('✅ Album manifest created');
  console.log('✅ Portfolio manifest updated');
}

importRavens().catch(console.error);
