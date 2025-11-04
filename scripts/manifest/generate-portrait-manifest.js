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
    console.warn(`⚠️  Could not read folder: ${folderPath} - generate-portrait-manifest.js:41`, error.message);
    return [];
  }
}

/**
 * Extract date from folder metadata or default to current year
 */
function extractDateFromFolder(collectionName) {
  // For portrait collections, we typically don't extract dates from filenames
  // Instead, use manual metadata or default to current year
  const currentYear = new Date().getFullYear();
  return {
    dateDisplay: currentYear.toString(),
    dateISO: `${currentYear}-01-01T00:00:00.000Z`
  };
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
 * Generate collection description based on name
 */
function generateDescription(collectionName) {
  const nameLower = collectionName.toLowerCase();
  
  if (nameLower.includes('character')) {
    return 'Intimate character studies capturing personality and emotion';
  } else if (nameLower.includes('environmental')) {
    return 'Portraits in natural environments and locations';
  } else if (nameLower.includes('studio')) {
    return 'Professional studio portraits with controlled lighting';
  } else if (nameLower.includes('editorial')) {
    return 'Editorial and fashion portrait photography';
  } else if (nameLower.includes('corporate')) {
    return 'Professional corporate and business portraits';
  }
  
  return `Portrait collection: ${collectionName}`;
}

/**
 * Generate manifest.json for a single portrait collection folder
 */
async function generateManifestForFolder(collectionName, folderPath) {
  const imageFiles = await getImageFiles(folderPath);
  const dateInfo = extractDateFromFolder(collectionName);
  const tags = generateTags(collectionName);
  const description = generateDescription(collectionName);
  
  const manifest = {
    collectionName,
    folderPath: path.relative(BASE_PORTRAIT, folderPath).replace(/\\/g, '/'),
    totalImages: imageFiles.length,
    images: imageFiles,
    tags,
    dateDisplay: dateInfo.dateDisplay,
    dateISO: dateInfo.dateISO,
    description,
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0'
    }
  };
  
  // Write individual folder manifest
  const manifestPath = path.join(folderPath, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✅ Generated manifest for: ${collectionName} (${imageFiles.length} images) - generate-portrait-manifest.js:129`);
  
  return manifest;
}

/**
 * Main function: Scan Portrait folder and generate all manifests
 */
async function scanAndGenerateManifests() {
  console.log('🎭 Portrait Manifest Generator - generate-portrait-manifest.js:138');
  console.log('================================\n - generate-portrait-manifest.js:139');
  
  if (!(await exists(BASE_PORTRAIT))) {
    console.error(`❌ Portrait folder not found: ${BASE_PORTRAIT} - generate-portrait-manifest.js:142`);
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
      console.error(`❌ Failed to process collection: ${item} - generate-portrait-manifest.js:164`, error.message);
    }
  }
  
  // Sort collections by name
  collections.sort((a, b) => a.collectionName.localeCompare(b.collectionName));
  
  // Generate aggregated portrait-manifest.json
  const portraitManifest = {
    version: '1.0',
    generated: new Date().toISOString(),
    totalCollections: collections.length,
    totalImages: collections.reduce((sum, c) => sum + c.totalImages, 0),
    collections: collections.map(({ 
      collectionName, 
      folderPath, 
      totalImages, 
      images, 
      tags, 
      dateDisplay, 
      dateISO, 
      description 
    }) => ({
      collectionName,
      folderPath,
      totalImages,
      images,
      tags,
      dateDisplay,
      dateISO,
      description
    }))
  };
  
  await fs.writeFile(MANIFEST_OUTPUT, JSON.stringify(portraitManifest, null, 2), 'utf8');
  
  console.log('\n📊 Summary: - generate-portrait-manifest.js:200');
  console.log(`Collections: ${collections.length} - generate-portrait-manifest.js:201`);
  console.log(`Total Images: ${portraitManifest.totalImages} - generate-portrait-manifest.js:202`);
  console.log(`\n✅ Portrait manifest generated: ${MANIFEST_OUTPUT} - generate-portrait-manifest.js:203`);
}

// Run the generator
scanAndGenerateManifests().catch(err => {
  console.error('❌ Failed to generate portrait manifest: - generate-portrait-manifest.js:208', err);
  process.exit(1);
});
