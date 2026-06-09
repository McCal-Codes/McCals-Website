#!/usr/bin/env node
/**
 * Portrait Portfolio Manifest Generator
 *
 * Scans Portrait folder for collections (Character Studies, Environmental, Studio, etc.),
 * treats each immediate subfolder within a collection as an "album" (using the folder name),
 * and aggregates everything into portrait-manifest.json.
 * Follows same patterns as concert/nature/events manifest generators.
 */
const fs = require('fs').promises;
const path = require('path');
const { notify } = require('../utils/manifest-webhook');
const { IMAGE_EXTENSION_RE, dedupeImageEntries } = require('../utils/image-manifest-dedupe.js');

// Configuration
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

async function readJsonFile(filePath, label) {
  if (!(await exists(filePath))) {
    return null;
  }

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn(
      `[WARN] Invalid portrait ${label} metadata:`,
      path.relative(process.cwd(), filePath),
      error && error.message,
    );
    return null;
  }
}

async function loadTagsMetadata(folderPath) {
  return readJsonFile(path.join(folderPath, 'tags.json'), 'tags');
}

async function loadCaptions(folderPath) {
  return readJsonFile(path.join(folderPath, 'captions.json'), 'captions');
}

function getCaptionForImage(captions, filename) {
  if (!captions) return null;
  if (captions[filename]) return captions[filename];

  const extension = path.extname(filename);
  const basename = path.basename(filename, extension);
  const alternateExtensions = ['.webp', '.jpg', '.jpeg', '.png', '.avif'];

  for (const alternateExtension of alternateExtensions) {
    const alternate = `${basename}${alternateExtension}`;
    if (captions[alternate]) return captions[alternate];
  }

  for (const [captionFilename, caption] of Object.entries(captions)) {
    const captionBasename = path.basename(captionFilename, path.extname(captionFilename));
    if (captionBasename === basename) return caption;
  }

  return null;
}

function textOrUndefined(value) {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed || undefined;
}

function normaliseTags(tags) {
  if (!Array.isArray(tags)) return [];

  return [
    ...new Set(
      tags
        .map((tag) => String(tag).trim())
        .filter(Boolean),
    ),
  ];
}

function buildImageMetadata(images, captions) {
  if (!captions) return undefined;

  const imageMetadata = {};

  for (const image of images) {
    const perImage = getCaptionForImage(captions, image) || {};
    const caption = textOrUndefined(perImage.caption);
    const description = textOrUndefined(perImage.description);
    const alt = textOrUndefined(perImage.alt);

    if (!caption && !description && !alt) continue;

    imageMetadata[image] = {
      ...(caption ? { caption } : {}),
      ...(description ? { description } : {}),
      ...(alt ? { alt } : {}),
    };
  }

  return Object.keys(imageMetadata).length ? imageMetadata : undefined;
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
        imageFiles = imageFiles.concat(
          subImages.map((img) => path.relative(folderPath, path.join(itemPath, img))),
        );
      } else if (stats.isFile() && IMAGE_EXTENSION_RE.test(item)) {
        imageFiles.push(item);
      }
    }

    return dedupeImageEntries(imageFiles);
  } catch (error) {
    console.warn(
      `⚠️  Could not read folder: ${folderPath} - generate-portrait-manifest.js:58`,
      error.message,
    );
    return [];
  }
}

/**
 * Scan a portrait collection folder and return albums + flattened images.
 * Each immediate subfolder becomes an album; any loose images stay at the collection level.
 */
async function getAlbumsForCollection(collectionPath) {
  const entries = await fs.readdir(collectionPath);
  const collectionCaptions = await loadCaptions(collectionPath);
  const albums = [];
  let flattenedImages = [];
  const looseImages = [];

  for (const entry of entries) {
    const entryPath = path.join(collectionPath, entry);
    const stats = await fs.stat(entryPath);

    if (stats.isDirectory()) {
      // Album = immediate subfolder; gather images inside it (including nested)
      const albumImagesRaw = await getImageFiles(entryPath);
      const albumPrefix = path.basename(entryPath);
      const albumImages = albumImagesRaw.map((img) => path.posix.join(albumPrefix, img));
      const albumMetadata = await loadTagsMetadata(entryPath);
      const albumCaptions = await loadCaptions(entryPath);
      const albumImageMetadata = buildImageMetadata(albumImagesRaw, albumCaptions);

      const album = {
        albumName: albumPrefix,
        folderPath: path.relative(BASE_PORTRAIT, entryPath).replace(/\\/g, '/'),
        totalImages: albumImagesRaw.length,
        images: albumImages,
      };

      const albumTags = normaliseTags(albumMetadata?.tags);
      if (albumTags.length) album.tags = albumTags;
      if (albumImageMetadata) album.imageMetadata = albumImageMetadata;

      albums.push(album);

      flattenedImages = flattenedImages.concat(albumImages);
    } else if (stats.isFile() && IMAGE_EXTENSION_RE.test(entry)) {
      looseImages.push(entry);
    }
  }

  // Keep album order predictable
  albums.sort((a, b) => a.albumName.localeCompare(b.albumName, undefined, { sensitivity: 'base' }));

  // Add any loose images that live directly in the collection folder
  const dedupedLooseImages = dedupeImageEntries(looseImages);
  const looseImageMetadata = buildImageMetadata(dedupedLooseImages, collectionCaptions);
  flattenedImages = dedupeImageEntries(flattenedImages.concat(dedupedLooseImages));

  return { albums, flattenedImages, looseImages: dedupedLooseImages, imageMetadata: looseImageMetadata };
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
  const { albums, flattenedImages, looseImages, imageMetadata } = await getAlbumsForCollection(folderPath);
  const tags = generateTags(collectionName);

  const manifest = {
    collectionName,
    folderPath: path.relative(BASE_PORTRAIT, folderPath).replace(/\\/g, '/'),
    totalImages: flattenedImages.length,
    images: flattenedImages,
    albums,
    looseImages,
    tags,
    ...(imageMetadata ? { imageMetadata } : {}),
    metadata: {
      generated: new Date().toISOString(),
      version: '1.0.0',
    },
  };

  // Per-folder manifests are no longer written; we keep a single aggregated manifest per portfolio.
  console.log(
    `🔎 Processed collection: ${collectionName} (${flattenedImages.length} images across ${albums.length} albums, ${looseImages.length} loose)`,
  );

  return manifest;
}

/**
 * Main function: Scan Portrait folder and generate all manifests
 */
async function scanAndGenerateManifests() {
  console.log('🎭 Portrait Manifest Generator - generate-portrait-manifest.js:162');
  console.log('================================\n - generate-portrait-manifest.js:163');

  if (!(await exists(BASE_PORTRAIT))) {
    console.error(
      `❌ Portrait folder not found: ${BASE_PORTRAIT} - generate-portrait-manifest.js:166`,
    );
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
      console.error(
        `❌ Failed to process collection: ${item} - generate-portrait-manifest.js:188`,
        error.message,
      );
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
    collections: collections.map(
      ({ collectionName, folderPath, totalImages, images, tags, albums, looseImages, imageMetadata }) => ({
        collectionName,
        folderPath,
        totalImages,
        images,
        tags,
        albums,
        looseImages,
        ...(imageMetadata ? { imageMetadata } : {}),
      }),
    ),
  };

  // Write aggregated portrait manifest (idempotent)
  try {
    const content = JSON.stringify(portraitManifest, null, 2) + '\n';
    // Honor --force CLI flag to always overwrite
    const FORCE = process.argv.includes('--force');
    let writeIt = true;
    if (!FORCE && (await exists(MANIFEST_OUTPUT))) {
      const existing = await fs.readFile(MANIFEST_OUTPUT, 'utf8');
      if (existing === content) writeIt = false;
    }
    if (FORCE) {
      console.log(
        '⚡ force provided: will overwrite aggregated manifest even if unchanged - generate-portrait-manifest.js:225',
      );
    }
    if (writeIt) {
      const tmpFile = `${MANIFEST_OUTPUT}.tmp`;
      await fs.writeFile(tmpFile, content, 'utf8');
      await fs.rename(tmpFile, MANIFEST_OUTPUT);
      console.log('\n📊 Summary: - generate-portrait-manifest.js:230');
      console.log(`Collections: ${collections.length} - generate-portrait-manifest.js:231`);
      console.log(
        `Total Images: ${portraitManifest.totalImages} - generate-portrait-manifest.js:232`,
      );
      console.log(
        `\n✅ Portrait manifest generated: ${MANIFEST_OUTPUT} - generate-portrait-manifest.js:233`,
      );
      try {
        await notify('portrait', { path: MANIFEST_OUTPUT, written: true });
      } catch (err) {
        console.warn(
          'Failed to notify manifest webhook (portrait): - generate-portrait-manifest.js:237',
          err && err.message,
        );
      }
    } else {
      console.log(
        `\n↩️  Aggregated portrait manifest unchanged, skipping write: ${MANIFEST_OUTPUT} - generate-portrait-manifest.js:240`,
      );
      if (process.env.MANIFEST_WEBHOOK_ALWAYS === 'true') {
        try {
          await notify('portrait', { path: MANIFEST_OUTPUT, written: false });
        } catch (err) {
          console.warn(
            'Failed to notify manifest webhook (portrait, no write): - generate-portrait-manifest.js:245',
            err && err.message,
          );
        }
      }
    }
  } catch (err) {
    console.error(
      `❌ Failed to write portrait manifest: ${err.message} - generate-portrait-manifest.js:250`,
    );
  }
}

// Run the generator
scanAndGenerateManifests().catch((err) => {
  console.error(
    '❌ Failed to generate portrait manifest: - generate-portrait-manifest.js:256',
    err,
  );
  process.exit(1);
});
