#!/usr/bin/env node
/**
 * Terrible Tailgate Album Import Preparation
 * Creates organized structure for site import
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function prepareTerribleTailgate() {
  const auditPath = join(__dirname, '..', '..', 'updates', 'exports-audit-complete-2026-04-06.json');
  const audit = JSON.parse(await fs.readFile(auditPath, 'utf-8'));
  
  // Get all Terrible Tailgate photos
  const tailgatePhotos = audit.importable.filter(f => 
    f.eventName.toLowerCase().includes('terrible tailgate')
  );

  // Group by game (opponent)
  const games = {};
  tailgatePhotos.forEach(p => {
    const gameMatch = p.eventName.match(/Terrible Tailgate\s*-\s*(.+)/i);
    const opponent = gameMatch ? gameMatch[1].trim() : 'Unknown';
    
    if (!games[opponent]) {
      games[opponent] = {
        opponent,
        category: 'Events',
        year: p.year,
        date: p.date,
        photos: [],
        totalSize: 0
      };
    }
    games[opponent].photos.push(p);
    games[opponent].totalSize += p.sizeBytes;
  });

  // Create manifest entries
  const manifestEntries = Object.values(games).map(game => {
    const id = `terrible-tailgate-${game.opponent.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${game.year}`;
    
    // Sort photos by filename (CAL number) for consistent ordering
    const sortedPhotos = game.photos.sort((a, b) => {
      const numA = a.filename.match(/CAL(\d+)/)?.[1] || 0;
      const numB = b.filename.match(/CAL(\d+)/)?.[1] || 0;
      return parseInt(numA) - parseInt(numB);
    });

    // Pick cover image (first photo or middle one for variety)
    const coverIndex = Math.floor(sortedPhotos.length / 3);
    const coverImage = sortedPhotos[coverIndex]?.filename || sortedPhotos[0]?.filename;

    return {
      type: 'Events',
      category: 'Event Photography',
      name: `Terrible Tailgate - ${game.opponent}`,
      id,
      folderPath: `Events/Terrible Tailgate/${game.opponent}/${game.year}`,
      dateDisplay: game.date ? `${game.date.monthName || ''} ${game.year}` : game.year,
      date: {
        year: game.date?.year || parseInt(game.year),
        month: game.date?.month || 1,
        monthName: game.date ? new Date(game.date.year, game.date.month - 1).toLocaleString('default', { month: 'long' }) : 'Unknown',
        day: game.date?.day || 1,
        iso: game.date ? `${game.date.year}-${String(game.date.month).padStart(2, '0')}-${String(game.date.day).padStart(2, '0')}` : `${game.year}-01-01`
      },
      opponent: game.opponent,
      totalImages: game.photos.length,
      totalSizeMB: (game.totalSize / 1024 / 1024).toFixed(2),
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
  console.log('🟡 TERRIBLE TAILGATE ALBUM IMPORT PLAN');
  console.log('═'.repeat(70));
  console.log('');

  manifestEntries.forEach(album => {
    const avgSize = (parseFloat(album.totalSizeMB) / album.totalImages).toFixed(2);
    console.log(`📁 ${album.name}`);
    console.log(`   ID: ${album.id}`);
    console.log(`   Date: ${album.dateDisplay}`);
    console.log(`   Photos: ${album.totalImages} (${album.totalSizeMB} MB total, ${avgSize} MB avg)`);
    console.log(`   Cover: ${album.coverImage}`);
    console.log(`   Target: src/images/Portfolios/${album.folderPath}`);
    console.log('');
  });

  // Generate import checklist
  console.log('═'.repeat(70));
  console.log('IMPORT CHECKLIST');
  console.log('═'.repeat(70));
  console.log('');
  
  manifestEntries.forEach(album => {
    console.log(`☐ ${album.name}`);
    console.log(`   Create folder: src/images/Portfolios/${album.folderPath}`);
    console.log(`   Copy ${album.totalImages} photos`);
    console.log(`   Update portfolio-manifest.json`);
    console.log('');
  });

  // Save manifest
  const output = {
    series: 'Terrible Tailgate',
    totalAlbums: manifestEntries.length,
    totalPhotos: manifestEntries.reduce((sum, a) => sum + a.totalImages, 0),
    albums: manifestEntries
  };

  const outputPath = join(__dirname, '..', '..', 'updates', 'terrible-tailgate-import-plan.json');
  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log('💾 Saved to: updates/terrible-tailgate-import-plan.json');

  return output;
}

prepareTerribleTailgate().catch(console.error);
