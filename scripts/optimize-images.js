#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Optimizes images in portfolio folders using sharp.
 * - Compresses JPEGs to 80% quality
 * - Converts PNGs to WebP where beneficial
 * - Preserves EXIF data for date detection
 * - Only processes new/modified images
 */

const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

const PORTFOLIOS_BASE = path.join(__dirname, '../src/images/Portfolios');

// Optimization settings
const JPEG_QUALITY = 80;
const MAX_WIDTH = 3840; // 4K max
const MAX_HEIGHT = 2160;

const CACHE_FILE = path.join(__dirname, '../.cache/image-optimization-cache.json');

// In-memory cache
let optimizationCache = {};

// Load cache from disk
async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    optimizationCache = JSON.parse(data);
    log(`Loaded cache with ${Object.keys(optimizationCache).length} entries`);
  } catch {
    optimizationCache = {};
    log('No cache found, starting fresh');
  }
}

// Save cache to disk
async function saveCache() {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await fs.writeFile(CACHE_FILE, JSON.stringify(optimizationCache, null, 2));
  } catch (err) {
    error('Failed to save cache:', err.message);
  }
}

// Get file hash for cache key
async function getFileHash(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return `${stat.mtime.getTime()}-${stat.size}`;
  } catch {
    return null;
  }
}

// Track stats with cache
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  savedBytes: 0,
  fromCache: 0,
};

function log(message, ...args) {
  console.log(`📸 ${message}`, ...args);
}

function error(message, ...args) {
  console.error(`❌ ${message}`, ...args);
}

function success(message, ...args) {
  console.log(`✅ ${message}`, ...args);
}

async function getImageSize(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size;
  } catch {
    return 0;
  }
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    stats.skipped++;
    return;
  }

  try {
    const originalSize = await getImageSize(filePath);
    const fileHash = await getFileHash(filePath);
    const fileName = path.basename(filePath);

    // Check cache first
    if (optimizationCache[filePath] && optimizationCache[filePath].hash === fileHash) {
      log(`Skipping ${fileName} (cached: ${optimizationCache[filePath].savedMB}MB saved)`);
      stats.fromCache++;
      stats.savedBytes += optimizationCache[filePath].savedBytes;
      return;
    }

    const image = sharp(filePath);
    const metadata = await image.metadata();

    if (originalSize < 500000 && metadata.width <= MAX_WIDTH) {
      log(`Skipping ${fileName} (already optimized)`);
      stats.skipped++;
      optimizationCache[filePath] = { hash: fileHash, optimized: true, savedBytes: 0, savedMB: 0 };
      return;
    }

    let pipeline = sharp(filePath, { failOnError: false });

    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    if (ext === '.png') {
      pipeline = pipeline.png({
        quality: JPEG_QUALITY,
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
    } else {
      pipeline = pipeline.jpeg({
        quality: JPEG_QUALITY,
        mozjpeg: true,
        chromaSubsampling: '4:2:0',
      });
    }

    // sharp discards all metadata unless told otherwise. Without this, optimization
    // strips the IPTC/XMP rights fields embedded by scripts/metadata/embed-image-rights.js
    // — the copyright, creator and licensing statement that travel with a photograph
    // when it is copied off the site.
    pipeline = pipeline.withMetadata();

    const tempPath = `${filePath}.tmp`;
    await pipeline.toFile(tempPath);

    const optimizedSize = await getImageSize(tempPath);
    const savedBytes = originalSize - optimizedSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    if (savedBytes > originalSize * 0.05) {
      await fs.rename(tempPath, filePath);
      stats.savedBytes += savedBytes;
      stats.processed++;
      
      const savedMB = (savedBytes / 1024 / 1024).toFixed(2);
      optimizationCache[filePath] = { 
        hash: await getFileHash(filePath),
        optimized: true, 
        savedBytes: savedBytes,
        savedMB: savedMB,
        date: new Date().toISOString()
      };
      
      log(`Optimized ${fileName}: ${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB (saved ${savedPercent}%)`);
    } else {
      await fs.unlink(tempPath);
      stats.skipped++;
      log(`Skipping ${fileName} (minimal savings)`);
      optimizationCache[filePath] = { hash: fileHash, optimized: false, savedBytes: 0, savedMB: 0 };
    }
  } catch (err) {
    error(`Failed to optimize ${path.basename(filePath)}:`, err.message);
    stats.errors++;
  }
}

async function processDirectory(dirPath) {
  try {
    const items = await fs.readdir(dirPath);

    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = await fs.stat(itemPath);

      if (stat.isDirectory()) {
        // Skip manifest and hidden folders
        if (item.startsWith('.') || item === 'node_modules') {
          continue;
        }
        await processDirectory(itemPath);
      } else if (stat.isFile()) {
        await optimizeImage(itemPath);
      }
    }
  } catch (err) {
    error(`Failed to process directory ${dirPath}:`, err.message);
  }
}

async function optimizePortfolio(portfolioName) {
  const portfolioPath = path.join(PORTFOLIOS_BASE, portfolioName);

  try {
    const stat = await fs.stat(portfolioPath);
    if (!stat.isDirectory()) {
      error(`${portfolioName} is not a directory`);
      return;
    }

    log(`Optimizing ${portfolioName} portfolio...`);
    await processDirectory(portfolioPath);
  } catch (err) {
    error(`Failed to optimize ${portfolioName}:`, err.message);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
📸 Image Optimization Script v2.0 (with Cache)

Usage:
  node scripts/optimize-images.js [portfolio] [--clear-cache]

Arguments:
  portfolio    Portfolio to optimize (Concert, Portrait, Nature, etc.)
               If omitted, optimizes all portfolios
  --clear-cache   Clear the optimization cache and re-process all

Examples:
  node scripts/optimize-images.js Concert
  node scripts/optimize-images.js Portrait
  node scripts/optimize-images.js --clear-cache
  node scripts/optimize-images.js
`);
    process.exit(0);
  }

  // Handle --clear-cache
  if (args.includes('--clear-cache')) {
    optimizationCache = {};
    await saveCache();
    log('Cache cleared');
    const idx = args.indexOf('--clear-cache');
    args.splice(idx, 1);
  }

  // Load cache at start
  await loadCache();

  const portfolio = args[0];

  log('Starting image optimization...');
  const startTime = Date.now();

  if (portfolio) {
    await optimizePortfolio(portfolio);
  } else {
    const portfolios = await fs.readdir(PORTFOLIOS_BASE);
    for (const p of portfolios) {
      const pPath = path.join(PORTFOLIOS_BASE, p);
      const stat = await fs.stat(pPath);
      if (stat.isDirectory() && !p.startsWith('.')) {
        await optimizePortfolio(p);
      }
    }
  }

  // Save cache at end
  await saveCache();

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const savedMB = (stats.savedBytes / 1024 / 1024).toFixed(2);

  console.log('\n📊 Optimization Summary:');
  console.log(`   • Processed: ${stats.processed} images`);
  console.log(`   • From cache: ${stats.fromCache} images`);
  console.log(`   • Skipped: ${stats.skipped} images`);
  console.log(`   • Errors: ${stats.errors} images`);
  console.log(`   • Space saved: ${savedMB} MB`);
  console.log(`   • Duration: ${duration}s`);
  console.log(`   • Cache entries: ${Object.keys(optimizationCache).length}`);

  if (stats.errors > 0) {
    process.exit(1);
  }

  success('Image optimization complete!');
}

main().catch((err) => {
  error('Optimization failed:', err.message);
  process.exit(1);
});
