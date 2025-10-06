#!/usr/bin/env node

/**
 * Concert Folder Watcher
 * 
 * Automatically runs the concert build process when new photos are added
 * to any concert band folder or subfolder.
 * 
 * Watches: images/Portfolios/Concert/**/*.{jpg,jpeg,png,webp,gif}
 * Runs: npm run build:concert (organize folders + generate manifest)
 */

const chokidar = require('chokidar');
const { spawn } = require('child_process');
const path = require('path');

const CONCERT_PATH = path.join(process.cwd(), 'images', 'Portfolios', 'Concert');
const IMAGE_PATTERNS = ['**/*.jpg', '**/*.jpeg', '**/*.png', '**/*.webp', '**/*.gif'];

let buildTimeout = null;
let isBuilding = false;

function log(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`🎸 [${timestamp}] ${message}`, ...args);
}

function success(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`✅ [${timestamp}] ${message}`, ...args);
}

function error(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`❌ [${timestamp}] ${message}`, ...args);
}

function runBuild() {
  if (isBuilding) {
    log('Build already in progress, skipping...');
    return;
  }

  isBuilding = true;
  log('🔄 Running concert build process...');

  const buildProcess = spawn('npm', ['run', 'build:concert'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  buildProcess.on('close', (code) => {
    isBuilding = false;
    
    if (code === 0) {
      success('Concert build completed successfully!');
    } else {
      error(`Concert build failed with exit code ${code}`);
    }
  });

  buildProcess.on('error', (err) => {
    isBuilding = false;
    error('Concert build process error:', err.message);
  });
}

function debouncedBuild() {
  // Clear existing timeout
  if (buildTimeout) {
    clearTimeout(buildTimeout);
  }

  // Set new timeout to debounce multiple file changes
  buildTimeout = setTimeout(() => {
    runBuild();
  }, 2000); // Wait 2 seconds after last file change
}

function startWatching() {
  log('Starting concert folder watcher...');
  log(`Watching: ${CONCERT_PATH}`);
  log(`Patterns: ${IMAGE_PATTERNS.join(', ')}`);

  const watchPaths = IMAGE_PATTERNS.map(pattern => path.join(CONCERT_PATH, pattern));

  const watcher = chokidar.watch(watchPaths, {
    ignored: [
      '**/.DS_Store',
      '**/Thumbs.db',
      '**/manifest.json',
      '**/concert-manifest.json',
      '**/processing-summary.json'
    ],
    persistent: true,
    ignoreInitial: true, // Don't trigger on startup
    depth: 10, // Watch deeply nested folders
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    }
  });

  watcher
    .on('add', (filePath) => {
      const relativePath = path.relative(CONCERT_PATH, filePath);
      log(`📷 New image added: ${relativePath}`);
      debouncedBuild();
    })
    .on('change', (filePath) => {
      const relativePath = path.relative(CONCERT_PATH, filePath);
      log(`📷 Image changed: ${relativePath}`);
      debouncedBuild();
    })
    .on('unlink', (filePath) => {
      const relativePath = path.relative(CONCERT_PATH, filePath);
      log(`📷 Image removed: ${relativePath}`);
      debouncedBuild();
    })
    .on('addDir', (dirPath) => {
      const relativePath = path.relative(CONCERT_PATH, dirPath);
      log(`📁 New folder created: ${relativePath}`);
    })
    .on('unlinkDir', (dirPath) => {
      const relativePath = path.relative(CONCERT_PATH, dirPath);
      log(`📁 Folder removed: ${relativePath}`);
      debouncedBuild();
    })
    .on('error', (err) => {
      error('Watcher error:', err.message);
    })
    .on('ready', () => {
      success('Concert folder watcher is ready!');
      success('Add images to any concert folder to trigger auto-build');
    });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('Shutting down concert folder watcher...');
    watcher.close().then(() => {
      success('Watcher stopped');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('Shutting down concert folder watcher...');
    watcher.close().then(() => {
      success('Watcher stopped');
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
🎸 Concert Folder Watcher

Automatically runs the concert build process when new photos are added.

Usage:
  node scripts/watch-concert-folders.js
  npm run watch:concert

Features:
  • Watches images/Portfolios/Concert/**/*.{jpg,jpeg,png,webp,gif}
  • Debounces multiple changes (waits 2 seconds after last change)
  • Ignores system files (.DS_Store, Thumbs.db, manifests)
  • Runs: npm run build:concert (organize + generate manifest)
  • Graceful shutdown on Ctrl+C

What it does when you add photos:
  1. Auto-organizes folders into Band/Month Year structure
  2. Generates individual manifests for each folder
  3. Creates master manifest for the widget
  4. Updates everything automatically!

Examples:
  # Start watching
  npm run watch:concert

  # Stop watching
  Press Ctrl+C
`);
  process.exit(0);
}

// Start the watcher
if (require.main === module) {
  startWatching();
}