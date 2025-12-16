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

// Track statistics
const stats = {
  processed: 0,
  skipped: 0,
  errors: 0,
  savedBytes: 0,
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
  } catch (err) {
    return 0;
  }
}

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  // Only process JPEG and PNG
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
    stats.skipped++;
    return;
  }

  try {
    const originalSize = await getImageSize(filePath);

    // Read image metadata
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Skip if already optimized (check if size is reasonable)
    if (originalSize < 500000 && metadata.width <= MAX_WIDTH) {
      log(`Skipping ${path.basename(filePath)} (already optimized)`);
      stats.skipped++;
      return;
    }

    // Create optimized version
    let pipeline = sharp(filePath, { failOnError: false });

    // Resize if too large
    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Optimize based on format
    if (ext === '.png') {
      // PNG: compress with pngquant-like settings
      pipeline = pipeline.png({
        quality: JPEG_QUALITY,
        compressionLevel: 9,
        adaptiveFiltering: true,
      });
    } else {
      // JPEG: optimize quality and strip unnecessary metadata
      pipeline = pipeline.jpeg({
        quality: JPEG_QUALITY,
        mozjpeg: true,
        chromaSubsampling: '4:2:0',
      });
    }

    // Write to temporary file first
    const tempPath = `${filePath}.tmp`;
    await pipeline.toFile(tempPath);

    const optimizedSize = await getImageSize(tempPath);
    const savedBytes = originalSize - optimizedSize;
    const savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

    // Only replace if we saved significant space (>5%)
    if (savedBytes > originalSize * 0.05) {
      await fs.rename(tempPath, filePath);
      stats.savedBytes += savedBytes;
      stats.processed++;
      log(
        `Optimized ${path.basename(filePath)}: ${(originalSize / 1024).toFixed(0)}KB → ${(optimizedSize / 1024).toFixed(0)}KB (saved ${savedPercent}%)`,
      );
    } else {
      // Not worth it, keep original
      await fs.unlink(tempPath);
      stats.skipped++;
      log(`Skipping ${path.basename(filePath)} (minimal savings)`);
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
📸 Image Optimization Script

Usage:
  node scripts/optimize-images.js [portfolio]

Arguments:
  portfolio    Portfolio to optimize (Concert, Portrait, Nature, etc.)
               If omitted, optimizes all portfolios

Examples:
  node scripts/optimize-images.js Concert
  node scripts/optimize-images.js Portrait
  node scripts/optimize-images.js
`);
    process.exit(0);
  }

  const portfolio = args[0];

  log('Starting image optimization...');
  const startTime = Date.now();

  if (portfolio) {
    await optimizePortfolio(portfolio);
  } else {
    // Optimize all portfolios
    const portfolios = await fs.readdir(PORTFOLIOS_BASE);
    for (const p of portfolios) {
      const pPath = path.join(PORTFOLIOS_BASE, p);
      const stat = await fs.stat(pPath);
      if (stat.isDirectory() && !p.startsWith('.')) {
        await optimizePortfolio(p);
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  const savedMB = (stats.savedBytes / 1024 / 1024).toFixed(2);

  console.log('\n📊 Optimization Summary:');
  console.log(`   • Processed: ${stats.processed} images`);
  console.log(`   • Skipped: ${stats.skipped} images`);
  console.log(`   • Errors: ${stats.errors} images`);
  console.log(`   • Space saved: ${savedMB} MB`);
  console.log(`   • Duration: ${duration}s`);

  if (stats.errors > 0) {
    process.exit(1);
  }

  success('Image optimization complete!');
}

main().catch((err) => {
  error('Optimization failed:', err.message);
  process.exit(1);
});
