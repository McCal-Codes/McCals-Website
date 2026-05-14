#!/usr/bin/env node
/**
 * Convert Tailgate Albums to WebP
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';
import { createRequire } from 'module';
import { promisify } from 'util';

const execAsync = promisify(exec);
const require = createRequire(import.meta.url);
const { baseImageKey, dedupeImageEntries } = require('../utils/image-manifest-dedupe.js');

const ALBUMS = [
  'Cleveland Browns at Pittsburgh Tailgate',
  'Ravens at Pittsburgh Tailgate'
];

const BASE_DIR = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\Events';

async function convertToWebP() {
  console.log('🔄 CONVERTING TAILGATE ALBUMS TO WEBP');
  console.log('═'.repeat(70));
  
  for (const albumName of ALBUMS) {
    const albumDir = join(BASE_DIR, albumName);
    
    console.log(`\n📁 Processing: ${albumName}`);
    
    try {
      // Check if directory exists
      await fs.access(albumDir);
      
      // Get all JPG files
      const files = await fs.readdir(albumDir);
      const jpgFiles = files.filter(f => f.toLowerCase().endsWith('.jpg'));
      
      console.log(`   Found ${jpgFiles.length} JPG files`);
      
      let converted = 0;
      let failed = 0;
      
      for (const jpgFile of jpgFiles) {
        const jpgPath = join(albumDir, jpgFile);
        const webpFile = jpgFile.replace(/\.jpg$/i, '.webp');
        const webpPath = join(albumDir, webpFile);
        
        try {
          // Check if WebP already exists
          try {
            await fs.access(webpPath);
            // WebP exists, skip
            process.stdout.write('s');
            continue;
          } catch {
            // WebP doesn't exist, convert
          }
          
          // Convert using sharp or imagemagick
          // Try sharp first (Node.js), fallback to imagemagick CLI
          try {
            await convertWithSharp(jpgPath, webpPath);
          } catch {
            await convertWithImageMagick(jpgPath, webpPath);
          }
          
          converted++;
          process.stdout.write('.');
        } catch {
          failed++;
          process.stdout.write('x');
        }
      }
      
      console.log('');
      console.log(`   ✅ Converted: ${converted}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   ⏭️  Skipped (already WebP): ${jpgFiles.length - converted - failed}`);
      
      // Update album manifest
      await updateManifest(albumDir, albumName);
      
    } catch (err) {
      console.log(`   ⚠️  Error: ${err.message}`);
    }
  }
  
  console.log('\n═'.repeat(70));
  console.log('✅ Conversion complete');
}

async function convertWithSharp(jpgPath, webpPath) {
  // Try to use sharp if available
  try {
    const sharp = await import('sharp');
    await sharp.default(jpgPath)
      .webp({ quality: 85 })
      .toFile(webpPath);
  } catch {
    throw new Error('Sharp not available');
  }
}

async function convertWithImageMagick(jpgPath, webpPath) {
  // Use ImageMagick convert command
  const command = `magick convert "${jpgPath}" -quality 85 "${webpPath}"`;
  await execAsync(command);
}

async function updateManifest(albumDir, _albumName) {
  const manifestPath = join(albumDir, 'album-manifest.json');
  
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    
    // Add WebP versions to images array
    const webpImages = manifest.images.map(img => {
      const webpName = img.replace(/\.jpg$/i, '.webp');
      return webpName;
    });
    
    // Merge JPG and WebP, then keep only the preferred display entry per pair.
    const allImages = [...manifest.images, ...webpImages];
    manifest.images = dedupeImageEntries(allImages);
    manifest.totalImages = manifest.images.length;
    const coverKey = baseImageKey(manifest.coverImage || '');
    manifest.coverImage =
      manifest.images.find((image) => baseImageKey(image) === coverKey) ||
      manifest.images[0] ||
      manifest.coverImage;
    manifest.hasWebP = true;
    
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`   💾 Updated manifest (${manifest.images.length} display files)`);
  } catch (err) {
    console.log(`   ⚠️  Failed to update manifest: ${err.message}`);
  }
}

convertToWebP().catch(console.error);
