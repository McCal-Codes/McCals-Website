#!/usr/bin/env node

/**
 * Journalism Manifest Watcher
 * 
 * Automatically regenerates the journalism manifest when ANY changes occur
 * in the journalism portfolio directory (not just _import).
 * 
 * Watches: src/images/Portfolios/Journalism/ (all files)
 * Runs: npm run manifest:journalism --force
 */

const chokidar = require('chokidar');
const path = require('path');
const { spawn } = require('child_process');

const JOURNALISM_DIR = path.join(process.cwd(), 'src', 'images', 'Portfolios', 'Journalism');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

let isGenerating = false;
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

function isRelevantChange(filePath) {
  // Ignore system files, manifests, and temporary files
  const fileName = path.basename(filePath);
  if (fileName.startsWith('.') || fileName === 'README.md') return false;
  if (fileName.includes('manifest.json')) return false;
  if (fileName.includes('.tmp') || fileName.includes('.temp')) return false;
  
  // Include directories and image files
  return true;
}

function regenerateManifest() {
  if (isGenerating) {
    log('Manifest generation already in progress, skipping...');
    return;
  }

  isGenerating = true;
  log('🔄 Regenerating journalism manifest...');

  const proc = spawn('npm', ['run', 'manifest:journalism', '--', '--force'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  proc.on('close', (code) => {
    isGenerating = false;
    if (code === 0) {
      success('Journalism manifest regenerated successfully!');
    } else {
      error(`Manifest generation failed with exit code ${code}`);
    }
  });

  proc.on('error', (err) => {
    isGenerating = false;
    error('Failed to start manifest generation:', err.message);
  });
}

function scheduleRegeneration(filePath, eventType) {
  const relativePath = path.relative(JOURNALISM_DIR, filePath);
  log(`${eventType}: ${relativePath}`);
  
  // Debounce multiple changes
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    regenerateManifest();
  }, 1500); // Wait 1.5 seconds after last change
}

function startWatching() {
  log('Starting Journalism manifest watcher...');
  log(`Watching: ${JOURNALISM_DIR}`);

  const watcher = chokidar.watch(JOURNALISM_DIR, {
    ignored: [
      /node_modules/,
      /\.git/,
      /\.DS_Store$/,
      /Thumbs\.db$/,
      /journalism-manifest\.json$/,  // Don't watch our own output
      /manifest\.json$/              // Don't watch individual manifests
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 1000,
      pollInterval: 100
    },
    depth: 10 // Watch deeply nested folders
  });

  watcher
    .on('add', (filePath) => {
      if (isRelevantChange(filePath)) {
        scheduleRegeneration(filePath, 'File added');
      }
    })
    .on('change', (filePath) => {
      if (isRelevantChange(filePath)) {
        scheduleRegeneration(filePath, 'File changed');
      }
    })
    .on('unlink', (filePath) => {
      if (isRelevantChange(filePath)) {
        scheduleRegeneration(filePath, 'File removed');
      }
    })
    .on('addDir', (dirPath) => {
      if (isRelevantChange(dirPath)) {
        scheduleRegeneration(dirPath, 'Directory added');
      }
    })
    .on('unlinkDir', (dirPath) => {
      if (isRelevantChange(dirPath)) {
        scheduleRegeneration(dirPath, 'Directory removed');
      }
    })
    .on('error', (err) => {
      error('Watcher error:', err.message);
    })
    .on('ready', () => {
      success('Journalism manifest watcher is ready!');
      success('Any changes to the journalism folder will trigger manifest regeneration.');
    });

  // Graceful shutdown
  process.on('SIGINT', () => {
    log('Stopping Journalism manifest watcher...');
    watcher.close().then(() => {
      success('Watcher stopped');
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    log('Stopping Journalism manifest watcher...');
    watcher.close().then(() => {
      success('Watcher stopped');
      process.exit(0);
    });
  });
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
📰 Journalism Manifest Watcher

Automatically regenerates the journalism manifest when changes occur in the journalism portfolio.

Usage:
  node scripts/watch-journalism-manifest.js
  npm run watch:journalism-manifest

Features:
  • Watches src/images/Portfolios/Journalism/ (all files and folders)
  • Ignores system files, manifests, and temporary files
  • Debounces changes (waits 1.5 seconds after last change)
  • Runs: npm run manifest:journalism --force
  • Graceful shutdown on Ctrl+C

What triggers regeneration:
  • Adding new images anywhere in journalism folder
  • Creating new event/category folders
  • Moving or renaming files
  • Deleting files or folders
  • Any structural changes to the journalism portfolio

Examples:
  # Start watching
  npm run watch:journalism-manifest

  # Stop watching
  Press Ctrl+C

  # Add photos anywhere and see auto-regeneration:
  src/images/Portfolios/Journalism/Politics/New Event/photo.jpg → Auto-updates
  src/images/Portfolios/Journalism/Events/Conference/speaker.jpg → Auto-updates
  src/images/Portfolios/Journalism/loose-photo.jpg → Auto-updates
`);
  process.exit(0);
}

if (require.main === module) {
  startWatching();
}