#!/usr/bin/env node
/**
 * Terrible Tailgate - Separate Album Import Plan
 * Each game is its own standalone album for the same client
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function prepareSeparateAlbums() {
  const auditPath = join(__dirname, '..', '..', 'updates', 'exports-audit-complete-2026-04-06.json');
  const audit = JSON.parse(await fs.readFile(auditPath, 'utf-8'));
  
  // Get all Terrible Tailgate photos
  const tailgatePhotos = audit.importable.filter(f => 
    f.eventName.toLowerCase().includes('terrible tailgate')
  );

  // Group by opponent/game - each is its own album
  const albums = {};
  tailgatePhotos.forEach(p => {
    const gameMatch = p.eventName.match(/Terrible Tailgate\s*-\s*(.+)/i);
    const opponent = gameMatch ? gameMatch[1].trim() : 'Unknown';
    const albumName = `Terrible Tailgate - ${opponent}`;
    
    if (!albums[albumName]) {
      albums[albumName] = {
        name: albumName,
        client: 'Terrible Tailgate',
        opponent,
        category: 'Events',
        year: p.year,
        date: p.date,
        photos: [],
        totalSize: 0
      };
    }
    albums[albumName].photos.push(p);
    albums[albumName].totalSize += p.sizeBytes;
  });

  // Create manifest entries matching existing Events pattern
  const manifestEntries = Object.values(albums).map(album => {
    const dateObj = album.date || { year: parseInt(album.year), month: 1, day: 1 };
    const dateDisplay = dateObj.month && dateObj.year ? 
      `${new Date(dateObj.year, dateObj.month - 1).toLocaleString('default', { month: 'long' })} ${dateObj.year}` : 
      album.year;
    
    // Sort photos by CAL number
    const sortedPhotos = album.photos.sort((a, b) => {
      const numA = a.filename.match(/CAL(\d+)/)?.[1] || 0;
      const numB = b.filename.match(/CAL(\d+)/)?.[1] || 0;
      return parseInt(numA) - parseInt(numB);
    });

    // Pick cover (early photo in the sequence, not first)
    const coverIndex = Math.min(10, Math.floor(sortedPhotos.length / 4));
    const coverImage = sortedPhotos[coverIndex]?.filename;

    return {
      type: 'Events',
      category: 'Event Photography',
      name: album.name,
      folderPath: `Events/${album.name}`,
      dateDisplay,
      date: {
        year: dateObj.year,
        month: dateObj.month,
        monthName: new Date(dateObj.year, dateObj.month - 1).toLocaleString('default', { month: 'long' }),
        day: dateObj.day,
        iso: `${dateObj.year}-${String(dateObj.month).padStart(2, '0')}-${String(dateObj.day).padStart(2, '0')}`
      },
      client: album.client,
      opponent: album.opponent,
      totalImages: album.photos.length,
      totalSizeMB: (album.totalSize / 1024 / 1024).toFixed(2),
      avgSizeMB: ((album.totalSize / album.photos.length) / 1024 / 1024).toFixed(2),
      coverImage,
      images: sortedPhotos.map(p => p.filename),
      sourceFiles: sortedPhotos.map(p => ({
        filename: p.filename,
        sourcePath: p.fullPath,
        sizeMB: p.sizeMB
      }))
    };
  });

  // Sort by date (newest first)
  manifestEntries.sort((a, b) => new Date(b.date.iso) - new Date(a.date.iso));

  // Print summary
  console.log('🟡 TERRIBLE TAILGATE - SEPARATE ALBUM IMPORT PLAN');
  console.log('═'.repeat(70));
  console.log('Each game = its own standalone album (same client)\n');

  manifestEntries.forEach((album, i) => {
    console.log(`${i + 1}. 📁 ${album.name}`);
    console.log(`   Client: ${album.client}`);
    console.log(`   Date: ${album.dateDisplay}`);
    console.log(`   Photos: ${album.totalImages} (${album.totalSizeMB} MB total, ${album.avgSizeMB} MB avg)`);
    console.log(`   Cover: ${album.coverImage}`);
    console.log(`   Target: src/images/Portfolios/${album.folderPath}/`);
    console.log('');
  });

  console.log('═'.repeat(70));
  console.log('IMPORT STEPS (per album)');
  console.log('═'.repeat(70));
  console.log('');
  
  manifestEntries.forEach(album => {
    console.log(`${album.name}:`);
    console.log(`  1. mkdir -p "src/images/Portfolios/${album.folderPath}"`);
    console.log(`  2. Copy ${album.totalImages} photos to folder`);
    console.log(`  3. Add manifest entry to portfolio-manifest.json`);
    console.log('');
  });

  // Total summary
  const totalPhotos = manifestEntries.reduce((sum, a) => sum + a.totalImages, 0);
  const totalSize = manifestEntries.reduce((sum, a) => sum + parseFloat(a.totalSizeMB), 0);
  
  console.log('═'.repeat(70));
  console.log('SUMMARY');
  console.log('═'.repeat(70));
  console.log(`Total Albums: ${manifestEntries.length}`);
  console.log(`Total Photos: ${totalPhotos}`);
  console.log(`Total Size: ${totalSize.toFixed(2)} MB`);
  console.log(`Client: Terrible Tailgate (all albums)`);
  console.log('');

  // Save plan
  const output = {
    client: 'Terrible Tailgate',
    totalAlbums: manifestEntries.length,
    totalPhotos,
    totalSizeMB: totalSize.toFixed(2),
    structure: 'Separate albums (flat under Events/)',
    albums: manifestEntries
  };

  const outputPath = join(__dirname, '..', '..', 'updates', 'terrible-tailgate-separate-albums.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log('💾 Saved to: updates/terrible-tailgate-separate-albums.json');

  return output;
}

prepareSeparateAlbums().catch(console.error);
