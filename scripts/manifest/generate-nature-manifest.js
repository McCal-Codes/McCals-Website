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
const { IMAGE_EXTENSION_RE, dedupeImageEntries } = require('../utils/image-manifest-dedupe.js');
const BASE_NATURE = path.join(process.cwd(), 'src', 'images', 'Portfolios', 'Nature');
const WILDLIFE_BASE = path.join(BASE_NATURE, 'Wildlife');
const LANDSCAPES_BASE = path.join(BASE_NATURE, 'Landscapes');
const MANIFEST_OUTPUT = path.join(BASE_NATURE, 'nature-manifest.json');
const DIRECT_COLLECTION_EXCLUDES = new Set(['Wildlife', 'Landscapes', 'thumbs']);

async function exists(filePath) {
  try { await fs.access(filePath); return true; } catch { return false; }
}
async function isDirectory(dirPath) {
  try { const stats = await fs.stat(dirPath); return stats.isDirectory(); } catch { return false; }
}
async function getImageFiles(folderPath) {
  const items = await fs.readdir(folderPath);
  return dedupeImageEntries(items.filter(item => IMAGE_EXTENSION_RE.test(item)));
}

async function loadCaptions(folderPath) {
  const captionsPath = path.join(folderPath, 'captions.json');
  if (!(await exists(captionsPath))) {
    return null;
  }

  try {
    return JSON.parse(await fs.readFile(captionsPath, 'utf8'));
  } catch (error) {
    console.warn(`⚠️  Invalid captions.json in ${path.basename(folderPath)}: ${error.message}`);
    return null;
  }
}

function getCaptionForImage(captions, filename) {
  if (!captions) return null;
  if (captions[filename]) return captions[filename];

  const ext = path.extname(filename);
  const base = filename.slice(0, -ext.length);
  const alternateExtensions =
    ext.toLowerCase() === '.webp' ? ['.jpg', '.jpeg', '.png'] : ['.webp'];

  for (const alternateExt of alternateExtensions) {
    const alternate = `${base}${alternateExt}`;
    if (captions[alternate]) return captions[alternate];
  }

  return null;
}

function buildImageEntries(imageFiles, captions, tags) {
  return imageFiles.map((filename) => {
    const perImage = getCaptionForImage(captions, filename);
    if (!perImage) {
      return filename;
    }

    return {
      filename,
      path: filename,
      caption: perImage.caption,
      description: perImage.description,
      alt: perImage.alt,
      tags: perImage.tags || tags,
    };
  });
}

async function loadExistingManifest(manifestPath) {
  if (!(await exists(manifestPath))) {
    return null;
  }

  try {
    return JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function withoutGenerated(manifest) {
  return {
    ...manifest,
    metadata: {
      ...manifest.metadata,
      generated: null,
    },
  };
}

async function generateManifestForFolder(collectionName, folderPath, tags) {
  const imageFiles = await getImageFiles(folderPath);
  if (imageFiles.length === 0) {
    return null;
  }

  const captions = await loadCaptions(folderPath);
  const images = buildImageEntries(imageFiles, captions, tags);
  const manifestPath = path.join(folderPath, 'manifest.json');
  const existingManifest = await loadExistingManifest(manifestPath);
  const manifest = {
    collectionName,
    folderPath: path.relative(BASE_NATURE, folderPath).replace(/\\/g, '/'),
    totalImages: imageFiles.length,
    images,
    tags,
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  if (
    existingManifest?.metadata?.generated &&
    JSON.stringify(withoutGenerated(existingManifest)) === JSON.stringify(withoutGenerated(manifest))
  ) {
    manifest.metadata.generated = existingManifest.metadata.generated;
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  return manifest;
}
async function scanAndGenerateManifests() {
  const collections = [];
  // Direct top-level collections, such as Flowers & Plants
  const natureItems = await fs.readdir(BASE_NATURE);
  for (const item of natureItems) {
    if (item.startsWith('.') || item.endsWith('.json') || DIRECT_COLLECTION_EXCLUDES.has(item)) {
      continue;
    }

    const itemPath = path.join(BASE_NATURE, item);
    if (await isDirectory(itemPath)) {
      const manifest = await generateManifestForFolder(item, itemPath, [item.toLowerCase()]);
      if (manifest) {
        collections.push(manifest);
      }
    }
  }

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
            if (manifest) {
              collections.push(manifest);
            }
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
        if (manifest) {
          collections.push(manifest);
        }
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
