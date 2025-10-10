#!/usr/bin/env node

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const CONFIG = {
  watchPath: 'src/images/Portfolios/Nature',
  manifestScript: 'node scripts/manifest/generate-nature-manifest.js',
  debounceMs: 2000, // Wait 2 seconds after changes before regenerating
  logFile: 'logs/auto-nature-manifest.log'
};

class AutoNatureManifestWatcher {
  constructor() {
    this.debounceTimer = null;
    this.isGenerating = false;
    this.changeQueue = new Set();
    this.ensureLogDir();
    this.log('🌱 Auto-nature-manifest watcher starting...');
  }

  ensureLogDir() {
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    try {
      fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
    } catch (error) {
      console.error('Failed to write to log file: - watch-nature-manifest.js:39', error.message);
    }
  }

  async regenerateManifest() {
    if (this.isGenerating) {
      this.log('⏳ Manifest generation already in progress, skipping...');
      return;
    }
    this.isGenerating = true;
    try {
      this.log('🔄 Regenerating nature manifest...');
      const output = execSync(CONFIG.manifestScript, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      this.log('✅ Nature manifest regenerated successfully');
      this.changeQueue.clear();
    } catch (error) {
      this.log(`❌ Error regenerating manifest: ${error.message}`, true);
    } finally {
      this.isGenerating = false;
    }
  }

  scheduleRegeneration(filePath, eventType) {
    this.changeQueue.add(`${eventType}:${filePath}`);
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.log(`📁 Changes detected: ${Array.from(this.changeQueue).join(', ')}`);
      this.regenerateManifest();
    }, CONFIG.debounceMs);
  }

  isRelevantFile(filePath) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const extension = path.extname(filePath).toLowerCase();
    return imageExtensions.includes(extension) || !extension;
  }

  isRelevantDirectory(dirPath) {
    const dirName = path.basename(dirPath);
    return !dirName.startsWith('.') && !dirName.includes('manifest');
  }

  startWatching() {
    this.log(`👀 Watching directory: ${CONFIG.watchPath}`);
    const watcher = chokidar.watch(CONFIG.watchPath, {
      ignored: [
        /node_modules/,
        /\.git/,
        /manifest\.json$/,
        /\.DS_Store$/,
        /Thumbs\.db$/
      ],
      ignoreInitial: true,
      persistent: true,
      depth: 10
    });
    watcher.on('add', (filePath) => {
      if (this.isRelevantFile(filePath)) {
        this.log(`➕ New file added: ${filePath}`);
        this.scheduleRegeneration(filePath, 'add');
      }
    });
    watcher.on('unlink', (filePath) => {
      if (this.isRelevantFile(filePath)) {
        this.log(`➖ File removed: ${filePath}`);
        this.scheduleRegeneration(filePath, 'remove');
      }
    });
    watcher.on('addDir', (dirPath) => {
      if (this.isRelevantDirectory(dirPath)) {
        this.log(`📁 New directory added: ${dirPath}`);
        this.scheduleRegeneration(dirPath, 'addDir');
      }
    });
    watcher.on('unlinkDir', (dirPath) => {
      if (this.isRelevantDirectory(dirPath)) {
        this.log(`📁 Directory removed: ${dirPath}`);
        this.scheduleRegeneration(dirPath, 'removeDir');
      }
    });
    watcher.on('error', (error) => {
      this.log(`❌ Watcher error: ${error.message}`, true);
    });
    this.log('✅ File watcher ready! Add images to trigger auto-regeneration.');
    process.on('SIGINT', () => {
      this.log('🛑 Stopping file watcher...');
      watcher.close();
      process.exit(0);
    });
    return watcher;
  }
}

const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
if (showHelp) {
  console.log(`
🌱 Auto-Nature-Manifest Watcher

Automatically regenerates the nature manifest when images or folders are added/removed.

Usage:
  node scripts/watchers/watch-nature-manifest.js [options]

Options:
  --help, -h     Show this help message

Features:
  • Watches src/images/Portfolios/Nature for changes
  • Debounces changes (waits 2 seconds after last change)
  • Logs all activity to logs/auto-nature-manifest.log
  • Handles multiple file formats (.jpg, .jpeg, .png, .gif, .webp)
  • Ignores system files and existing manifest files

Press Ctrl+C to stop watching.
  `);
  process.exit(0);
}

const watcher = new AutoNatureManifestWatcher();
watcher.startWatching();
