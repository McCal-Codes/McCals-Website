
// All requires at the very top
const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const sharp = require('sharp');
const os = require('os');

// Ensure Electron fully exits when all windows are closed (prevents lingering processes)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// --- Cleanup logic to close all services/processes on app quit ---
app.on('before-quit', () => {
  // If you start any child processes, servers, or watchers, close/kill them here.
  // Example:
  // if (myChildProcess) myChildProcess.kill();
  // if (myServer) myServer.close();
  // if (myWatcher) myWatcher.close();
  // Add more cleanup as needed.
});


// General-purpose error/warning logger for main process
function logMainError(msg) {
  try {
    const ts = new Date().toISOString();
    fs.appendFileSync('main-error.log', `[${ts}] ${msg}\n`);
  } catch {}
}
process.on('uncaughtException', (err) => {
  logMainError((err && err.stack) ? err.stack : String(err));
});
process.on('unhandledRejection', (reason) => {
  logMainError('Unhandled rejection: ' + (reason && reason.stack ? reason.stack : String(reason)));
});
process.on('warning', (warning) => {
  logMainError('Warning: ' + (warning && warning.stack ? warning.stack : String(warning)));
});

const userDataDir = path.join(os.homedir(), '.mccal-image-compress');
const configPath = path.join(userDataDir, 'config.json');

function loadSettings() {
  try {
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch {}
  return { format: 'jpeg', quality: 80, lastFolder: '' };
}

function saveSettings(settings) {
  try {
    if (!fs.existsSync(userDataDir)) fs.mkdirSync(userDataDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(settings, null, 2));
  } catch {}
}

// IPC handlers for settings
ipcMain.handle('get-settings', () => {
  return loadSettings();
});

ipcMain.handle('save-settings', (event, settings) => {
  saveSettings(settings);
  return true;
});
// Sanitize file/folder names for cross-platform safety
function sanitizeName(name) {
  return name.replace(/[\\/:*?"<>|\x00-\x1F]/g, '_').replace(/\s+/g, ' ').trim();
}
// ...existing code...

function createWindow() {
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    resizable: false,
    title: 'Local Image Compressor',
  });
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.handle('compress-images', async (event, opts) => {
  const { files, portfolio, format, quality, categoryInfo } = opts;
  // Sort files for deterministic naming
  const sortedFiles = [...files].sort();
  if (sortedFiles.length > 50) {
    return { error: 'Please drop no more than 50 images at a time.' };
  }
  const outputDir = dialog.showOpenDialogSync({
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select Output Folder',
  });
  if (!outputDir) return { error: 'No output folder selected.' };

  // Parse portfolio/category for folder structure
  // Examples: 'Events/EventName', 'Concert/Band/Month Year', 'Journalism/Category/Event', 'Nature/Category/Collection'
  const portfolioParts = portfolio.split('/').map(s => s.trim()).filter(Boolean);
  let subfolder = '';
  let manifestType = 'generic';
  if (portfolioParts.length >= 2 && portfolioParts[0].toLowerCase() === 'events') {
    // Events/EventName
    subfolder = path.join('Events', portfolioParts[1]);
    manifestType = 'event';
  } else if (portfolioParts.length >= 3 && portfolioParts[0].toLowerCase() === 'concert') {
    // Concert/Band/Month Year
    subfolder = path.join('Concert', portfolioParts[1], portfolioParts[2]);
    manifestType = 'concert';
  } else if (portfolioParts.length >= 3 && portfolioParts[0].toLowerCase() === 'journalism') {
    // Journalism/Category/Event
    subfolder = path.join('Journalism', portfolioParts[1], portfolioParts[2]);
    manifestType = 'journalism';
  } else if (portfolioParts.length >= 3 && portfolioParts[0].toLowerCase() === 'nature') {
    // Nature/Category/Collection
    subfolder = path.join('Nature', portfolioParts[1], portfolioParts[2]);
    manifestType = 'nature';
  } else {
    // Fallback: use portfolio as folder
    subfolder = portfolioParts.join('_');
  }

  // Always put output in a _web subfolder at the end
  const subfolderParts = subfolder.split(path.sep);
  if (subfolderParts.length > 0) {
    subfolderParts[subfolderParts.length - 1] = subfolderParts[subfolderParts.length - 1] + '_web';
  }
  const webSubfolder = subfolderParts.join(path.sep);
  const targetDir = path.join(outputDir[0], webSubfolder);
  fs.mkdirSync(targetDir, { recursive: true });
  const results = [];
  const usedNames = new Set();
  const outputNames = [];
  // Parallel image compression using Promise.all
  await Promise.all(sortedFiles.map(async (file, i) => {
    try {
      let ext = path.extname(file).toLowerCase();
      let outExt = '.' + (format === 'jpeg' ? 'jpg' : format);
      let origBase = sanitizeName(path.basename(file, ext));
      let outName = origBase + outExt;
      while (usedNames.has(outName)) {
        outName = origBase + '-' + Math.floor(Math.random()*10000) + outExt;
      }
      usedNames.add(outName);
      const outPath = path.join(targetDir, outName);
      // Skip if output file already exists
      if (fs.existsSync(outPath)) {
        results[i] = { file: outName, status: 'skipped', reason: 'File exists' };
        outputNames[i] = null;
        return;
      }
      // Image size check: skip if input is smaller than output after compression
      let img = sharp(file);
      let inputSize = 0;
      try { inputSize = fs.statSync(file).size; } catch {}
      let buffer;
      if (format === 'jpeg') {
        buffer = await img.jpeg({ quality }).toBuffer();
      } else if (format === 'png') {
        buffer = await img.png({ quality }).toBuffer();
      } else if (format === 'webp') {
        buffer = await img.webp({ quality }).toBuffer();
      } else {
        buffer = await img.toBuffer();
      }
      if (buffer.length >= inputSize && inputSize > 0) {
        results[i] = { file: outName, status: 'skipped', reason: 'Input smaller than output' };
        outputNames[i] = null;
        return;
      }
      fs.writeFileSync(outPath, buffer);
      results[i] = { file: outName, status: 'ok' };
      outputNames[i] = outName;
    } catch (e) {
      results[i] = { file: file, status: 'error', error: e.message };
      outputNames[i] = null;
    }
  }));
  // Remove nulls from outputNames (failed compressions)
  const filteredOutputNames = outputNames.filter(Boolean);

  // Write manifest.json in targetDir, matching manifest conventions
  let manifest = {};
  const now = new Date();
  if (manifestType === 'concert') {
    manifest = {
      bandName: portfolioParts[1],
      folderName: portfolioParts[2],
      totalImages: outputNames.length,
      images: outputNames,
      metadata: {
        generated: now.toISOString(),
        version: "1.0"
      }
    };
  } else if (manifestType === 'event') {
    manifest = {
      eventName: portfolioParts[1],
      category: 'Event',
      totalImages: outputNames.length,
      images: outputNames.map(name => ({ path: path.join('src/images/Portfolios', subfolder, name).replace(/\\/g, '/') })),
      metadata: {
        generated: now.toISOString(),
        version: "1.0"
      }
    };
  } else if (manifestType === 'journalism') {
    manifest = {
      eventName: portfolioParts[2],
      category: portfolioParts[1],
      totalImages: outputNames.length,
      images: outputNames.map(name => ({ filename: name, path: name })),
      metadata: {
        generated: now.toISOString(),
        version: "1.0"
      }
    };
  } else if (manifestType === 'nature') {
    // Special handling for wildlife/birds: if category is 'animal' and multiple birds, create per-bird folders/manifests
    if (categoryInfo && typeof categoryInfo.category === 'string') {
      const cat = categoryInfo.category.toLowerCase();
      if (cat === 'animal' && outputNames.length > 1) {
        // Per-animal folders (already implemented above)
        const animalMap = {};
        sortedFiles.forEach((file, i) => {
          if (!outputNames[i]) return;
          const ext = path.extname(file);
          const animalName = sanitizeName(path.basename(file, ext));
          if (!animalMap[animalName]) animalMap[animalName] = [];
          animalMap[animalName].push(outputNames[i]);
        });
        Object.entries(animalMap).forEach(([animalName, images]) => {
          const animalFolder = path.join(targetDir, animalName);
          fs.mkdirSync(animalFolder, { recursive: true });
          images.forEach(imgName => {
            const srcPath = path.join(targetDir, imgName);
            const destPath = path.join(animalFolder, imgName);
            if (srcPath !== destPath && fs.existsSync(srcPath)) {
              fs.copyFileSync(srcPath, destPath);
              fs.unlinkSync(srcPath);
            }
          });
          const animalManifest = {
            collectionName: animalName,
            folderPath: `Wildlife/${portfolioParts[1]}/${animalName}`,
            totalImages: images.length,
            images,
            tags: [portfolioParts[1].toLowerCase()],
            metadata: {
              generated: now.toISOString(),
              version: "1.0"
            }
          };
          fs.writeFileSync(path.join(animalFolder, 'manifest.json'), JSON.stringify(animalManifest, null, 2) + '\n');
        });
        fs.rmSync(targetDir, { recursive: true, force: true });
        shell.openPath(path.dirname(targetDir));
        return { results, outputPath: path.dirname(targetDir), manifestError: null };
      } else if (cat === 'landscape' && outputNames.length > 1) {
        // Per-location/title folders for landscapes
        const locationMap = {};
        sortedFiles.forEach((file, i) => {
          if (!outputNames[i]) return;
          const ext = path.extname(file);
          const locationName = sanitizeName(path.basename(file, ext));
          if (!locationMap[locationName]) locationMap[locationName] = [];
          locationMap[locationName].push(outputNames[i]);
        });
        Object.entries(locationMap).forEach(([locationName, images]) => {
          const locationFolder = path.join(targetDir, locationName);
          fs.mkdirSync(locationFolder, { recursive: true });
          images.forEach(imgName => {
            const srcPath = path.join(targetDir, imgName);
            const destPath = path.join(locationFolder, imgName);
            if (srcPath !== destPath && fs.existsSync(srcPath)) {
              fs.copyFileSync(srcPath, destPath);
              fs.unlinkSync(srcPath);
            }
          });
          const locationManifest = {
            collectionName: locationName,
            folderPath: `Nature/Landscape/${locationName}`,
            totalImages: images.length,
            images,
            tags: ['landscape'],
            metadata: {
              generated: now.toISOString(),
              version: "1.0"
            }
          };
          fs.writeFileSync(path.join(locationFolder, 'manifest.json'), JSON.stringify(locationManifest, null, 2) + '\n');
        });
        fs.rmSync(targetDir, { recursive: true, force: true });
        shell.openPath(path.dirname(targetDir));
        return { results, outputPath: path.dirname(targetDir), manifestError: null };
      }
    }
    // Default single manifest logic
    let tags = [];
    if (categoryInfo && categoryInfo.category) {
      tags = [categoryInfo.category];
    }
    manifest = {
      collectionName: portfolioParts[2],
      folderPath: portfolioParts[1] + '/' + portfolioParts[2],
      totalImages: outputNames.length,
      images: outputNames,
      tags,
      metadata: {
        generated: now.toISOString(),
        version: "1.0"
      }
    };
  } else {
    manifest = {
      portfolio: portfolio,
      totalImages: outputNames.length,
      images: outputNames,
      metadata: {
        generated: now.toISOString(),
        version: "1.0"
      }
    };
  }
  if (categoryInfo && manifestType !== 'nature') {
    manifest.categoryInfo = categoryInfo;
  }
  // Sanitize targetDir (last segment)
  let safeTargetDir = targetDir;
  try {
    const parts = targetDir.split(path.sep);
    if (parts.length > 1) {
      parts[parts.length-1] = sanitizeName(parts[parts.length-1]);
      safeTargetDir = parts.join(path.sep);
    }
  } catch {}
  const manifestPath = path.join(safeTargetDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  // Validate manifest.json after write
  let manifestError = null;
  try {
    const manifestData = fs.readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(manifestData);
    // Basic schema check: must have metadata, totalImages, images (array)
    if (!parsed.metadata || typeof parsed.totalImages !== 'number' || !Array.isArray(parsed.images)) {
      manifestError = 'Manifest missing required fields.';
    }
  } catch (e) {
    manifestError = 'Manifest validation error: ' + e.message;
  }
  // Open the output folder in the system file explorer
  shell.openPath(safeTargetDir);
  return { results, outputPath: safeTargetDir, manifestError };
});
