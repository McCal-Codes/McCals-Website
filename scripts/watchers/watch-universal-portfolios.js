#!/usr/bin/env node

/**
 * Universal Portfolio Watcher
 * 
 * Automatically runs the universal build process when new photos are added
 * to ANY portfolio folder (Concert, Journalism, Events, etc.).
 * 
 * Watches: images/Portfolios/ (all image files)
 * Runs: npm run build:universal (organize + generate all manifests)
 */

const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// NOTE: Portfolios live under src/images/Portfolios in this repo.
// The previous path (without "src") caused the watcher to sit idle and never fire.
const PORTFOLIOS_PATH = path.join(process.cwd(), 'src', 'images', 'Portfolios');
const IMAGE_PATTERNS = ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.gif'];

let buildTimeout = null;
let isBuilding = false;

function log(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`📸 [${timestamp}] ${message}`, ...args);
}

function success(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`✅ [${timestamp}] ${message}`, ...args);
}

function error(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`❌ [${timestamp}] ${message}`, ...args);
}

function runUniversalBuild() {
  if (isBuilding) {
    log('Universal build already in progress, skipping...');
    return;
  }

  isBuilding = true;
  log('🔄 Running universal portfolio build process...');

  const buildProcess = spawn('npm', ['run', 'build:universal'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('close', (code) => {
    isBuilding = false;
    
    if (code === 0) {
      success('Universal portfolio build completed successfully!');
      success('All manifests updated and ready for widgets! 🚀');
    } else {
      error(`Universal portfolio build failed with exit code ${code}`);
    }
  });

  buildProcess.on('error', (err) => {
    isBuilding = false;
    error('Universal portfolio build process error:', err.message);
  });
}

function debouncedBuild() {
  // Clear existing timeout
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }

  // Set new timeout to debounce multiple file changes
  buildTimeout = setTimeout(() => {
    runUniversalBuild();
  }, 3000); // Wait 3 seconds after last file change (longer for universal build)
}

function getPortfolioType(filePath) {
  const relativePath = path.relative(PORTFOLIOS_PATH, filePath);
  const pathParts = relativePath.split(path.sep);
  return pathParts[0] || 'Unknown';
}

function startWatching() {
  if (!fs.existsSync(PORTFOLIOS_PATH)) {
    error(`Portfolio root not found at ${PORTFOLIOS_PATH}. Is the repo structure different?`);
    process.exit(1);
  }

  log('Starting universal portfolio watcher...');
  log(`Watching: ${PORTFOLIOS_PATH}`);
  log(`Patterns: ${IMAGE_PATTERNS.join(', ')}`);

  const watchPaths = IMAGE_PATTERNS.map(pattern => path.join(PORTFOLIOS_PATH, pattern));

  const watcher = chokidar.watch(watchPaths, {
    ignored: [
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/manifest.json',
      '**/concert-manifest.json',
      '**/portfolio-manifest.json',
      '**/processing-summary.json'
    ],
    persistent: true,
    ignoreInitial: true, // Don't trigger on startup
    depth: 15, // Watch very deeply nested folders
    awaitWriteFinish: {
      stabilityThreshold: 1500,
      pollInterval: 100
    }
  });

  watcher
    .on('add', (filePath) => {
      const relativePath = path.relative(PORTFOLIOS_PATH, filePath);
      const portfolioType = getPortfolioType(filePath);
      log(`📷 New image added to ${portfolioType}: ${path.basename(relativePath)}`);
      debouncedBuild();
    })
    .on('change', (filePath) => {
      const relativePath = path.relative(PORTFOLIOS_PATH, filePath);
      const portfolioType = getPortfolioType(filePath);
      log(`📷 Image changed in ${portfolioType}: ${path.basename(relativePath)}`);
      debouncedBuild();
    })
    .on('unlink', (filePath) => {
      const relativePath = path.relative(PORTFOLIOS_PATH, filePath);
      const portfolioType = getPortfolioType(filePath);
      log(`📷 Image removed from ${portfolioType}: ${path.basename(relativePath)}`);
      debouncedBuild();
    })
    .on('addDir', (dirPath) => {
      const relativePath = path.relative(PORTFOLIOS_PATH, dirPath);
      const portfolioType = getPortfolioType(dirPath);
      log(`📁 New folder created in ${portfolioType}: ${relativePath}`);
    })
    .on('unlinkDir', (dirPath) => {
      const relativePath = path.relative(PORTFOLIOS_PATH, dirPath);
      const portfolioType = getPortfolioType(dirPath);
      log(`📁 Folder removed from ${portfolioType}: ${relativePath}`);
      debouncedBuild();
    })
    .on('error', (err) => {
      error('Universal watcher error:', err.message);
    })
    .on('ready', () => {
      success('Universal portfolio watcher is ready! 🎨');
      success('Add images to ANY portfolio folder to trigger auto-build');
      console.log('\n🎯 Watching all portfolio types:');
      console.log('   • Concert (bands with Month Year folders)');
      console.log('   • Journalism (direct images or organized folders)');
      console.log('   • Events (ready for future content)');
      console.log('   • Any new portfolio types you add!');
      console.log('\n⚡ What happens when you add photos:');
      console.log('   1. Auto-organizes Concert folders (Band/Month Year)');
      console.log('   2. Generates concert-specific manifest');
      console.log('   3. Generates universal portfolio manifest');
      console.log('   4. All widgets update automatically! 🚀\n');
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down universal portfolio watcher...');
    watcher.close().then(() => {
      success('Universal watcher stopped');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('Shutting down universal portfolio watcher...');
    watcher.close().then(() => {
      success('Universal watcher stopped');
      process.exit(0);
    });
  });

  return watcher;
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
📸 Universal Portfolio Watcher

Automatically runs the universal build process when photos are added to ANY portfolio.

Usage:
  node scripts/watch-universal-portfolios.js
  npm run watch:universal

Features:
  • Watches images/Portfolios/ (all image file types)
  • Monitors ALL portfolio types (Concert, Journalism, Events, etc.)
  • Debounces multiple changes (waits 3 seconds after last change)
  • Ignores system files and manifests
  • Runs: npm run build:universal
  • Graceful shutdown on Ctrl+C

What it does when you add photos ANYWHERE:
  1. Auto-organizes Concert folders into Band/Month Year structure
  2. Generates individual Concert manifests
  3. Generates master Concert manifest
  4. Generates universal portfolio manifest (ALL portfolios)
  5. All widgets update automatically!

Supported Portfolio Types:
  • Concert: Band-based concert photography
  • Journalism: Political events, portraits, news
  • Events: Corporate events, parties, etc.
  • Any new types you add in images/Portfolios/

Examples:
  # Start universal watching
  npm run watch:universal

  # Stop watching  
  Press Ctrl+C

  # Add photos to any portfolio:
  images/Portfolios/Concert/New Band/photo.jpg       → Auto-organizes
  images/Portfolios/Journalism/news-photo.jpg        → Auto-updates
  images/Portfolios/Events/Corporate/event.jpg       → Auto-includes
`);
  process.exit(0);
}

// Start the watcher
if (require.main === module) {
  startWatching();
}
