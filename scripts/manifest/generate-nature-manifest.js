#!/usr/bin/env node
/**
 * Nature Portfolio Manifest Generator
 *
 * Scans Birds and Landscapes/Locations folders under Nature,
 * auto-generates per-folder manifest.json, and aggregates into nature-manifest.json.
 * Mirrors concert manifest logic for auto-population.
 */
const fs = require('fs').promises;
const path = require('path');
const { notify } = require('../utils/manifest-webhook');
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;
const BASE_NATURE = path.join(process.cwd(), 'src', 'images', 'Portfolios', 'Nature');
const WILDLIFE_BASE = path.join(BASE_NATURE, 'Wildlife');
const LANDSCAPES_BASE = path.join(BASE_NATURE, 'Landscapes');
const MANIFEST_OUTPUT = path.join(BASE_NATURE, 'nature-manifest.json');

async function exists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}
async function isDirectory(dirPath) {
  try { const stats = await fs.stat(dirPath); return stats.isDirectory(); } catch { return false; }
}
async function getImageFiles(folderPath) {
  const items = await fs.readdir(folderPath);
  return items.filter(item => IMAGE_EXTENSIONS.test(item));
}
async function generateManifestForFolder(collectionName, folderPath, tags) {
  const imageFiles = await getImageFiles(folderPath);
  const manifest = {
    collectionName,
    folderPath: path.relative(BASE_NATURE, folderPath).replace(/\\/g, '/'),
    totalImages: imageFiles.length,
    images: imageFiles,
    tags,
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0'
    }
  };
  await fs.writeFile(path.join(folderPath, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}
async function scanAndGenerateManifests() {
  const collections = [];
  // Wildlife (all animal types)
  if (await exists(WILDLIFE_BASE)) {
    const animalTypes = await fs.readdir(WILDLIFE_BASE);
    for (const animalType of animalTypes) {
      const animalTypePath = path.join(WILDLIFE_BASE, animalType);
      if (await isDirectory(animalTypePath)) {
        const speciesFolders = await fs.readdir(animalTypePath);
        for (const species of speciesFolders) {
          const speciesPath = path.join(animalTypePath, species);
          if (await isDirectory(speciesPath)) {
            const manifest = await generateManifestForFolder(species, speciesPath, [animalType.toLowerCase()]);
            collections.push(manifest);
          }
        }
      }
    }
  }
  // Landscapes/Locations
  if (await exists(LANDSCAPES_BASE)) {
    const landscapes = await fs.readdir(LANDSCAPES_BASE);
    for (const loc of landscapes) {
      const locPath = path.join(LANDSCAPES_BASE, loc);
      if (await isDirectory(locPath)) {
        const manifest = await generateManifestForFolder(loc, locPath, ['landscape']);
        collections.push(manifest);
      }
    }
  }
  // Aggregate nature-manifest.json
  const natureManifest = {
    version: '1.0.0',
    generated: new Date().toISOString(),
    totalCollections: collections.length,
    collections: collections.map(({ collectionName, folderPath, totalImages, images, tags }) => ({ collectionName, folderPath, totalImages, images, tags }))
  };
  await fs.writeFile(MANIFEST_OUTPUT, JSON.stringify(natureManifest, null, 2), 'utf8');
  console.log(`✅ Nature manifest generated: ${MANIFEST_OUTPUT}`);
  try {
    await notify('nature', { path: MANIFEST_OUTPUT, written: true });
  } catch (err) {
    console.warn('Failed to notify manifest webhook (nature):', err && err.message);
  }
}
scanAndGenerateManifests().catch(err => { console.error('❌ Failed to generate nature manifest:', err); process.exit(1); });
