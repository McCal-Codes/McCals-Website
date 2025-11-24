#!/usr/bin/env node
/**
 * Portrait Portfolio Manifest Generator
 *
 * Scans Portrait folder for collections (Character Studies, Environmental, Studio, etc.),
 * auto-generates per-folder manifest.json, and aggregates into portrait-manifest.json.
 * Follows same patterns as concert/nature/events manifest generators.
 */
const fs = require('fs').promises;
const path = require('path');
const { notify } = require('../utils/manifest-webhook');

// Configuration
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;
const BASE_PORTRAIT = path.join(process.cwd(), 'src', 'images', 'Portfolios', 'Portrait');
const MANIFEST_OUTPUT = path.join(BASE_PORTRAIT, 'portrait-manifest.json');

// Helper functions
async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function getImageFiles(folderPath) {
  try {
    const items = await fs.readdir(folderPath);
    let imageFiles = [];
    
    for (const item of items) {
      const itemPath = path.join(folderPath, item);
      const stats = await fs.stat(itemPath);
      
      if (stats.isDirectory()) {
        // Recursively scan subdirectories for images
        const subImages = await getImageFiles(itemPath);
        imageFiles = imageFiles.concat(subImages.map(img => path.relative(folderPath, path.join(itemPath, img))));
      } else if (stats.isFile() && IMAGE_EXTENSIONS.test(item)) {
        imageFiles.push(item);
      }
    }
    
    return imageFiles.sort();
  } catch (error) {
    console.warn(`⚠️  Could not read folder: ${folderPath} - generate-portrait-manifest.js:56`, error.message);
    return [];
  }
}

/**
 * Determine appropriate tags based on collection name
 */
function generateTags(collectionName) {
  const baseTags = ['portrait'];
  const nameLower = collectionName.toLowerCase();
  
  if (nameLower.includes('character') || nameLower.includes('study')) {
    baseTags.push('character', 'black-and-white');
  } else if (nameLower.includes('environmental') || nameLower.includes('location')) {
    baseTags.push('environmental', 'location');
  } else if (nameLower.includes('studio') || nameLower.includes('headshot')) {
    baseTags.push('studio', 'professional');
  } else if (nameLower.includes('editorial') || nameLower.includes('fashion')) {
    baseTags.push('editorial', 'fashion');
  } else if (nameLower.includes('corporate') || nameLower.includes('business')) {
    baseTags.push('corporate', 'professional');
  }
  
  return baseTags;
}

/**
 * Generate manifest.json for a single portrait collection folder
 */
async function generateManifestForFolder(collectionName, folderPath) {
  const imageFiles = await getImageFiles(folderPath);
  const tags = generateTags(collectionName);
  
  const manifest = {
    collectionName,
    folderPath: path.relative(BASE_PORTRAIT, folderPath).replace(/\\/g, '/'),
    totalImages: imageFiles.length,
    images: imageFiles,
    tags,
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0'
    }
  };
  
  // Per-folder manifests are no longer written; we keep a single aggregated manifest per portfolio.
  console.log(`🔎 Processed collection: ${collectionName} (${imageFiles.length} images) - generate-portrait-manifest.js:103`);
  
  return manifest;
}

/**
 * Main function: Scan Portrait folder and generate all manifests
 */
async function scanAndGenerateManifests() {
  console.log('🎭 Portrait Manifest Generator - generate-portrait-manifest.js:112');
  console.log('================================\n - generate-portrait-manifest.js:113');
  
  if (!(await exists(BASE_PORTRAIT))) {
    console.error(`❌ Portrait folder not found: ${BASE_PORTRAIT} - generate-portrait-manifest.js:116`);
    process.exit(1);
  }
  
  const collections = [];
  
  // Scan all subdirectories in Portrait folder
  const items = await fs.readdir(BASE_PORTRAIT);
  
  for (const item of items) {
    const itemPath = path.join(BASE_PORTRAIT, item);
    
    // Skip files (like portrait-manifest.json)
    if (!(await isDirectory(itemPath))) {
      continue;
    }
    
    // Generate manifest for this collection
    try {
      const manifest = await generateManifestForFolder(item, itemPath);
      collections.push(manifest);
    } catch (error) {
      console.error(`❌ Failed to process collection: ${item} - generate-portrait-manifest.js:138`, error.message);
    }
  }
  
  // Sort collections by name
  collections.sort((a, b) => a.collectionName.localeCompare(b.collectionName));
  
  // Generate aggregated portrait-manifest.json
  const portraitManifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalCollections: collections.length,
    totalImages: collections.reduce((sum, c) => sum + c.totalImages, 0),
    collections: collections.map(({ 
      collectionName, 
      folderPath, 
      totalImages, 
      images, 
      tags 
    }) => ({
      collectionName,
      folderPath,
      totalImages,
      images,
      tags
    }))
  };
  
  // Write aggregated portrait manifest (idempotent)
  try {
    const content = JSON.stringify(portraitManifest, null, 2) + '\n';
    let writeIt = true;
    if (await exists(MANIFEST_OUTPUT)) {
      const existing = await fs.readFile(MANIFEST_OUTPUT, 'utf8');
      if (existing === content) writeIt = false;
    }
    // Honor --force CLI flag to always overwrite
    const FORCE = process.argv.includes('--force');
    if (FORCE) {
      console.log('⚡ --force provided: will overwrite aggregated manifest even if unchanged');
      writeIt = true;
    }
    if (writeIt) {
      await fs.writeFile(MANIFEST_OUTPUT, content, 'utf8');
      console.log('\n📊 Summary: - generate-portrait-manifest.js:176');
      console.log(`Collections: ${collections.length} - generate-portrait-manifest.js:177`);
      console.log(`Total Images: ${portraitManifest.totalImages} - generate-portrait-manifest.js:178`);
      console.log(`\n✅ Portrait manifest generated: ${MANIFEST_OUTPUT} - generate-portrait-manifest.js:179`);
      try {
        await notify('portrait', { path: MANIFEST_OUTPUT, written: true });
      } catch (err) {
        console.warn('Failed to notify manifest webhook (portrait):', err && err.message);
      }
    } else {
      console.log(`\n↩️  Aggregated portrait manifest unchanged, skipping write: ${MANIFEST_OUTPUT} - generate-portrait-manifest.js:181`);
      if (process.env.MANIFEST_WEBHOOK_ALWAYS === 'true') {
        try {
          await notify('portrait', { path: MANIFEST_OUTPUT, written: false });
        } catch (err) {
          console.warn('Failed to notify manifest webhook (portrait, no write):', err && err.message);
        }
      }
    }
  } catch (err) {
    console.error(`❌ Failed to write portrait manifest: ${err.message} - generate-portrait-manifest.js:184`);
  }
}

// Run the generator
scanAndGenerateManifests().catch(err => {
  console.error('❌ Failed to generate portrait manifest: - generate-portrait-manifest.js:190', err);
  process.exit(1);
});
