#!/usr/bin/env node

/**
 * Events Manifest v2 Watcher
 *
 * Automatically regenerates the events manifest when files in
 * src/images/Portfolios/Events/ change. Mirrors the behaviour of
 * the journalism watcher so photographers can just drop images.
 */

const chokidar = require('chokidar');
const path = require('path');
const { spawn } = require('child_process');

const EVENTS_DIR = path.join(process.cwd(), 'src', 'images', 'Portfolios', 'Events');
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

let isGenerating = false;
let debounceTimer = null;

function timestamp() {
  return new Date().toLocaleTimeString();
}

function log(message, ...args) {
  console.log(`dY", [${timestamp()}] ${message}`, ...args);
}

function success(message, ...args) {
  console.log(`?o. [${timestamp()}] ${message}`, ...args);
}

function error(message, ...args) {
  console.error(`??O [${timestamp()}] ${message}`, ...args);
}

function isRelevantChange(filePath) {
  if (!filePath) return false;
  const fileName = path.basename(filePath);
  if (!fileName) return false;
  if (fileName.startsWith('.')) return false;
  if (fileName.endsWith('~')) return false;
  if (fileName.includes('.tmp') || fileName.includes('.temp')) return false;
  if (fileName === 'events-manifest.json') return false;
  if (fileName === 'README.md') return false;
  if (fileName === 'CHANGELOG.md') return false;
  const ext = path.extname(fileName).toLowerCase();
  // Allow directories and common image formats
  return !ext || IMAGE_EXTS.has(ext);
}

function regenerateManifest() {
  if (isGenerating) {
    log('Manifest generation already in progress, skipping.');
    return;
  }

  isGenerating = true;
  log('dY", Regenerating events manifest (v2)...');

  const proc = spawn('npm', ['run', 'manifest:events', '--', '--force'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  proc.on('close', (code) => {
    isGenerating = false;
    if (code === 0) {
      success('Events manifest regenerated successfully!');
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
  const relative = path.relative(EVENTS_DIR, filePath) || path.basename(filePath);
  log(`${eventType}: ${relative}`);

  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    regenerateManifest();
  }, 1000);
}

function startWatching() {
  log('Starting events manifest watcher...');
  log(`Watching: ${EVENTS_DIR}`);

  const watcher = chokidar.watch(EVENTS_DIR, {
    ignored: [
      /node_modules/,
      /\\.git/,
      /\\.DS_Store$/,
      /Thumbs\\.db$/
    ],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 750,
      pollInterval: 100
    },
    depth: 8
  });

  watcher
    .on('add', (filePath) => {
      if (isRelevantChange(filePath)) scheduleRegeneration(filePath, 'File added');
    })
    .on('change', (filePath) => {
      if (isRelevantChange(filePath)) scheduleRegeneration(filePath, 'File changed');
    })
    .on('unlink', (filePath) => {
      if (isRelevantChange(filePath)) scheduleRegeneration(filePath, 'File removed');
    })
    .on('addDir', (dirPath) => {
      if (isRelevantChange(dirPath)) scheduleRegeneration(dirPath, 'Directory added');
    })
    .on('unlinkDir', (dirPath) => {
      if (isRelevantChange(dirPath)) scheduleRegeneration(dirPath, 'Directory removed');
    })
    .on('error', (err) => {
      error('Watcher error:', err.message);
    })
    .on('ready', () => {
      success('Events manifest watcher ready. Drop photos and the manifest will update.');
    });

  const shutdown = () => {
    log('Stopping events manifest watcher...');
    watcher.close().then(() => {
      success('Watcher stopped.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Events Manifest Watcher (v2)

Keeps src/images/Portfolios/Events/events-manifest.json in sync while you work.

Usage:
  npm run watch:events-manifest

Features:
  - Watches the entire Events portfolio tree
  - Ignores generated/manually edited manifest files
  - Debounces rapid burst writes
  - Runs: npm run manifest:events -- --force
`);
  process.exit(0);
}

startWatching();