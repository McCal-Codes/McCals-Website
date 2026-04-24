#!/usr/bin/env node

/**
 * Optimize Open Graph images in public-vite/images/
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Use absolute path to avoid Windows path issues
const PUBLIC_IMAGES = path.resolve(__dirname, '../sites/mcc-cal-vite/public-vite/images');
const FILES = ['portraits-og.jpg', 'nature-og.jpg', 'events-og.jpg', 'concerts-og.jpg'];
const TARGET_QUALITY = 75;

async function optimizeImage(filePath) {
  try {
    const original = await fs.stat(filePath);
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    console.log(`${path.basename(filePath)}: ${metadata.width}x${metadata.height}, ${(original.size / 1024).toFixed(0)}KB`);
    
    // Resize to optimal Open Graph dimensions if needed (1200x630)
    const needsResize = metadata.width > 1200 || metadata.height > 630;
    let pipeline = image;
    
    if (needsResize) {
      pipeline = pipeline.resize(1200, 630, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
    
    const optimized = await pipeline
      .jpeg({ 
        quality: TARGET_QUALITY, 
        mozjpeg: true, 
        chromaSubsampling: '4:2:0' 
      })
      .toBuffer();
    
    const saved = original.size - optimized.length;
    
    if (saved > 0) {
      await fs.writeFile(filePath, optimized);
      console.log(`  → Optimized to ${(optimized.length / 1024).toFixed(0)}KB (saved ${((saved / original.size) * 100).toFixed(1)}%)`);
    } else {
      console.log(`  → Already optimized`);
    }
  } catch (err) {
    console.error(`Error optimizing ${path.basename(filePath)}:`, err.message);
  }
}

async function main() {
  console.log('Optimizing Open Graph images...\n');
  
  for (const file of FILES) {
    const filePath = path.join(PUBLIC_IMAGES, file);
    await optimizeImage(filePath);
  }
  
  console.log('\n✅ Open Graph image optimization complete!');
}

main().catch(err => {
  console.error('Optimization failed:', err);
  process.exit(1);
});
