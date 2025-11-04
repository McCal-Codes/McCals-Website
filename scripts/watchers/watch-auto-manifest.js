#!/usr/bin/env node

const chokidar = require('chokidar');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const DEFAULT_TARGET = 'concert';

const TARGET_CONFIGS = {
  concert: {
    label: 'Concert Portfolio',
    watchPath: path.join('src', 'images', 'Portfolios', 'Concert'),
    manifestScript: 'manifest:concert',
    logFile: path.join('logs', 'auto-concert-manifest.log'),
    emoji: '🎸'
  },
  events: {
    label: 'Events Portfolio',
    watchPath: path.join('src', 'images', 'Portfolios', 'Events'),
    manifestScript: 'manifest:events',
    logFile: path.join('logs', 'auto-events-manifest.log'),
    emoji: '🎪'
  },
  journalism: {
    label: 'Journalism Portfolio',
    watchPath: path.join('src', 'images', 'Portfolios', 'Journalism'),
    manifestScript: 'manifest:journalism',
    logFile: path.join('logs', 'auto-journalism-manifest.log'),
    emoji: '📰'
  },
  nature: {
    label: 'Nature Portfolio',
    watchPath: path.join('src', 'images', 'Portfolios', 'Nature'),
    manifestScript: 'manifest:nature',
    logFile: path.join('logs', 'auto-nature-manifest.log'),
    emoji: '🌿'
  },
  portrait: {
    label: 'Portrait Portfolio',
    watchPath: path.join('src', 'images', 'Portfolios', 'Portrait'),
    manifestScript: 'manifest:portrait',
    logFile: path.join('logs', 'auto-portrait-manifest.log'),
    emoji: '🎭'
  }
};

class AutoManifestWatcher {
  constructor(targetName, config) {
    this.targetName = targetName;
    this.config = config;
    this.debounceTimer = null;
    this.isGenerating = false;
    this.changeQueue = new Set();
    this.watcherInstance = null;
    this.ensureLogDir();
    this.log(`${this.config.label} watcher starting...`);
  }

  ensureLogDir() {
    const logDir = path.dirname(this.config.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, isError = false) {
    const timestamp = new Date().toISOString();
    const prefix = this.config.emoji ? `${this.config.emoji} ` : '';
    const logMessage = `[${timestamp}] ${prefix}${message}`;

    if (isError) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }

    try {
      fs.appendFileSync(this.config.logFile, logMessage + '\n');
    } catch (error) {
      console.error(`[${this.config.label}] Failed to write to log file: - watch-auto-manifest.js:81`, error.message);
    }
  }

  async regenerateManifest() {
    if (this.isGenerating) {
      this.log('Manifest generation already in progress, skipping...');
      return;
    }

    this.isGenerating = true;

    try {
      this.log('Regenerating manifest...');
      // Allow watcher to pass a force flag to the underlying generator if requested
      const forceArg = this.force ? ' -- --force' : '';
      const cmd = `npm run ${this.config.manifestScript}${forceArg}`;
      this.log(`Executing: ${cmd}`);
      execSync(cmd, {
        encoding: 'utf8',
        cwd: process.cwd()
      });
      this.log('Manifest regenerated successfully');
      this.changeQueue.clear();
    } catch (error) {
      this.log(`Error regenerating manifest: ${error.message}`, true);
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
      this.log(`Changes detected: ${Array.from(this.changeQueue).join(', ')}`);
      this.regenerateManifest();
    }, 2000);
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
    const absoluteWatchPath = path.resolve(process.cwd(), this.config.watchPath);
    this.log(`Watching directory: ${absoluteWatchPath}`);

    const watcher = chokidar.watch(absoluteWatchPath, {
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
        this.log(`New file added: ${filePath}`);
        this.scheduleRegeneration(filePath, 'add');
      }
    });

    watcher.on('unlink', (filePath) => {
      if (this.isRelevantFile(filePath)) {
        this.log(`File removed: ${filePath}`);
        this.scheduleRegeneration(filePath, 'remove');
      }
    });

    watcher.on('addDir', (dirPath) => {
      if (this.isRelevantDirectory(dirPath)) {
        this.log(`Directory added: ${dirPath}`);
        this.scheduleRegeneration(dirPath, 'addDir');
      }
    });

    watcher.on('unlinkDir', (dirPath) => {
      if (this.isRelevantDirectory(dirPath)) {
        this.log(`Directory removed: ${dirPath}`);
        this.scheduleRegeneration(dirPath, 'removeDir');
      }
    });

    watcher.on('error', (error) => {
      this.log(`Watcher error: ${error.message}`, true);
    });

    this.log('File watcher ready! Add images to trigger auto-regeneration.');
    this.watcherInstance = watcher;
  }

  async stopWatching() {
    if (this.watcherInstance) {
      await this.watcherInstance.close();
      this.log('Watcher stopped.');
    }
  }
}

function parseTargets(argv) {
  if (argv.includes('--all')) {
    return Object.keys(TARGET_CONFIGS);
  }

  const targetFlagIndex = argv.findIndex(arg => arg === '--target' || arg === '-t');
  if (targetFlagIndex !== -1) {
    const targetArg = argv[targetFlagIndex + 1];
    if (!targetArg || targetArg.startsWith('-')) {
      console.error('Missing value for target option. - watch-auto-manifest.js:200');
      process.exit(1);
    }
    return targetArg.split(',').map(name => name.trim().toLowerCase()).filter(Boolean);
  }

  return [DEFAULT_TARGET];
}

function parseForceFlag(argv) {
  return argv.includes('--force');
}

function showHelp() {
  const targetsList = Object.entries(TARGET_CONFIGS)
    .map(([key, cfg]) => `  • ${key} – ${cfg.label}`)
    .join('\n');
  console.log(`
🎬 Auto-Manifest Watcher

Automatically regenerates manifests when images or folders are added/removed.

Usage:
  node scripts/watchers/watch-auto-manifest.js [options]

Options:
  --help, -h          Show this help message
  --target <names>    Comma-separated targets to watch (default: ${DEFAULT_TARGET})
  --all               Watch all supported targets simultaneously
  --list              List available targets

Available targets:
${targetsList}

Examples:
  node scripts/watchers/watch-auto-manifest.js --target nature
  node scripts/watchers/watch-auto-manifest.js --target concert,nature
  node scripts/watchers/watch-auto-manifest.js --all

Press Ctrl+C to stop watching.
  `);
}

function listTargets() {
  console.log('Available automanifest targets: - watch-auto-manifest.js:240');
  Object.entries(TARGET_CONFIGS).forEach(([key, cfg]) => {
    console.log(`• ${key}  ${cfg.label} (${cfg.watchPath}) - watch-auto-manifest.js:242`);
  });
}

async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }

    if (args.includes('--list')) {
      listTargets();
      process.exit(0);
    }

    const targetNames = parseTargets(args);
    const uniqueTargets = [...new Set(targetNames)];
    const invalidTargets = uniqueTargets.filter(name => !TARGET_CONFIGS[name]);
    if (invalidTargets.length > 0) {
      console.error(`Unknown target(s): ${invalidTargets.join(', ')} - watch-auto-manifest.js:262`);
      listTargets();
      process.exit(1);
    }

    const forceFlag = parseForceFlag(args);
    const watchers = uniqueTargets.map(name => {
      const w = new AutoManifestWatcher(name, TARGET_CONFIGS[name]);
      w.force = forceFlag;
      return w;
    });
    watchers.forEach(watcher => watcher.startWatching());

    process.on('SIGINT', async () => {
      console.log('\nStopping automanifest watchers... - watch-auto-manifest.js:271');
      await Promise.all(watchers.map(watcher => watcher.stopWatching()));
      process.exit(0);
    });
}

main().catch(error => {
  console.error('Automanifest watcher failed: - watch-auto-manifest.js:278', error.message);
  process.exit(1);
});