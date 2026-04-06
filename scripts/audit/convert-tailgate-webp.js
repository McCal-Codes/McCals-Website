#!/usr/bin/env node
/**
 * Convert Tailgate Albums to WebP
 */

const fs = require('fs').promises;
const path = require('path');

const ALBUMS = [
  'Cleveland Browns at Pittsburgh Tailgate',
  'Ravens at Pittsburgh Tailgate'
];

const BASE_DIR = path.join(__dirname, '../../src/images/Portfolios/Events');

async function convertToWebP() {
  console.log('🔄 CONVERTING TAILGATE ALBUMS TO WEBP');
  console.log('═'.repeat(70));
  
  // Check if sharp is available
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('❌ sharp module not found. Install with: npm install sharp');
    process.exit(1);
  }
  
  for (const albumName of ALBUMS) {
    const albumDir = path.join(BASE_DIR, albumName);
    
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
      let skipped = 0;
      
      for (const jpgFile of jpgFiles) {
        const jpgPath = path.join(albumDir, jpgFile);
        const webpFile = jpgFile.replace(/\.jpg$/i, '.webp');
        const webpPath = path.join(albumDir, webpFile);
        
        try {
          // Check if WebP already exists
          try {
            await fs.access(webpPath);
            // WebP exists, skip
            skipped++;
            process.stdout.write('s');
            continue;
          } catch {
            // WebP doesn't exist, convert
          }
          
          // Convert to WebP
          await sharp(jpgPath)
            .webp({ quality: 85, effort: 6 })
            .toFile(webpPath);
          
          converted++;
          process.stdout.write('.');
        } catch {
          failed++;
          process.stdout.write('x');
        }
      }
      
      console.log('');
      console.log(`   ✅ Converted: ${converted}`);
      console.log(`   ⏭️  Skipped (already WebP): ${skipped}`);
      console.log(`   ❌ Failed: ${failed}`);
      
      // Update album manifest
      if (converted > 0 || skipped > 0) {
        await updateManifest(albumDir);
      }
      
    } catch (err) {
      console.log(`   ⚠️  Error: ${err.message}`);
    }
  }
  
  console.log('\n═'.repeat(70));
  console.log('✅ Conversion complete');
  console.log('');
  console.log('Note: Both JPG and WebP versions now exist.');
  console.log('The site will use WebP when supported, fallback to JPG.');
}

async function updateManifest(albumDir) {
  const manifestPath = path.join(albumDir, 'album-manifest.json');
  
  try {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf-8'));
    
    // Add WebP versions to images array
    const webpImages = manifest.images
      .filter(img => img.toLowerCase().endsWith('.jpg'))
      .map(img => img.replace(/\.jpg$/i, '.webp'));
    
    // Merge JPG and WebP
    const allImages = [...manifest.images, ...webpImages];
    
    // Remove duplicates
    manifest.images = [...new Set(allImages)];
    manifest.totalImages = manifest.images.length;
    manifest.hasWebP = true;
    
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`   💾 Updated manifest (${manifest.images.length} total files)`);
  } catch (err) {
    console.log(`   ⚠️  Failed to update manifest: ${err.message}`);
  }
}

convertToWebP().catch(console.error);
