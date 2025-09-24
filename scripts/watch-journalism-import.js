#!/usr/bin/env node

/**
 * Journalism Import Watcher
 *
 * Watches the Journalism _import folder and automatically triggers
 * the existing import script when new images are added.
 *
 * Path watched:
 *   src/images/Portfolios/Journalism/_import
 *
 * Runs:
 *   npm run import:journalism
 */

const chokidar = require('chokidar');
const path = require('path');
const { spawn } = require('child_process');

const IMPORT_DIR = path.join(process.cwd(), 'src', 'images', 'Portfolios', 'Journalism', '_import');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry') || process.env.DRY_RUN === '1';

let isImporting = false;
let debounceTimer = null;

function log(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`📰 [${timestamp}] ${message}`, ...args);
}

function success(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`✅ [${timestamp}] ${message}`, ...args);
}

function error(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`❌ [${timestamp}] ${message}`, ...args);
}

function isImageFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTS.has(ext);
}

function triggerImport() {
  if (isImporting) {
    log('Import already in progress, skipping trigger.');
    return;
  }

  if (DRY_RUN) {
    log('DRY-RUN: Would run "npm run import:journalism" now.');
    return;
  }

  isImporting = true;
  log('🔄 Running journalism import...');

  const proc = spawn('npm', ['run', 'import:journalism'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  proc.on('close', (code) => {
    isImporting = false;
    if (code === 0) {
      success('Journalism import completed.');
    } else {
      error(`Journalism import failed with exit code ${code}`);
    }
  });

  proc.on('error', (err) => {
    isImporting = false;
    error('Failed to start journalism import process:', err.message);
  });
}

function scheduleImport() {
  // Debounce multiple file additions in quick succession
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    triggerImport();
  }, 1000);
}

function startWatching() {
  log('Starting Journalism import watcher...');
  log(`Watching: ${IMPORT_DIR}`);

  const watcher = chokidar.watch(IMPORT_DIR, {
    ignored: [
      /\.DS_Store$/,
      /Thumbs\.db$/
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 800,
      pollInterval: 100
    }
  });

  watcher
    .on('add', (filePath) => {
      if (isImageFile(filePath)) {
        log(`➕ New image detected: ${path.basename(filePath)}`);
        scheduleImport();
      }
    })
    .on('change', (filePath) => {
      if (isImageFile(filePath)) {
        log(`✏️  Image modified: ${path.basename(filePath)}`);
        scheduleImport();
      }
    })
    .on('addDir', (dirPath) => {
      log(`📁 New folder in _import: ${path.basename(dirPath)}`);
    })
    .on('unlink', (filePath) => {
      if (isImageFile(filePath)) {
        log(`➖ Image removed: ${path.basename(filePath)}`);
      }
    })
    .on('error', (err) => {
      error('Watcher error:', err.message);
    })
    .on('ready', () => {
      success('Journalism import watcher is ready! Drop images into _import to trigger import.');
    });

  // Graceful shutdown
  process.on('SIGINT', () => {
    log('Stopping Journalism import watcher...');
    watcher.close().then(() => {
      success('Watcher stopped');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('Stopping Journalism import watcher...');
    watcher.close().then(() => {
      success('Watcher stopped');
      process.exit(0);
    });
  });
}

if (require.main === module) {
  startWatching();
}
