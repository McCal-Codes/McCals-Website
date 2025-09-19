#!/usr/bin/env node

/**
 * Auto Concert Folder Organizer
 * 
 * Automatically organizes concert folders with intelligent features:
 * - Reorganizes existing folders: Concert/Band Name/Band Name/ -> Concert/Band Name/Month Year/
 * - Auto-detects dates from image filenames
 * - Creates proper Month Year folders for new bands
 * - Automatically generates manifests for all organized folders
 * - Handles both existing reorganization and new folder creation
 */

const fs = require('fs').promises;
const path = require('path');

const CONCERT_BASE = path.join(process.cwd(), 'images', 'Portfolios', 'Concert');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

// Date detection patterns from enhanced-manifest-generator.js
const DATE_PATTERNS = {
  // DDMMYY format: 13-01-24, 13_01_24, 130124
  ddmmyy_dash: { pattern: /(\d{2})[\-_](\d{2})[\-_](\d{2})/, parse: (m) => ({ day: +m[1], month: +m[2], year: 2000 + (+m[3]) }) },
  ddmmyy_solid: { pattern: /(\d{2})(\d{2})(\d{2})(?![\d])/, parse: (m) => ({ day: +m[1], month: +m[2], year: 2000 + (+m[3]) }) },
  
  // YYMMDD format: 250829, 25-08-29
  yymmdd_dash: { pattern: /(\d{2})[\-_](\d{2})[\-_](\d{2})/, parse: (m) => ({ year: 2000 + (+m[1]), month: +m[2], day: +m[3] }) },
  yymmdd_solid: { pattern: /(\d{2})(\d{2})(\d{2})(?![\d])/, parse: (m) => ({ year: 2000 + (+m[1]), month: +m[2], day: +m[3] }) },
  
  // YYYYMMDD format: 20241213, 2024-12-13
  yyyymmdd_dash: { pattern: /(\d{4})[\-_](\d{2})[\-_](\d{2})/, parse: (m) => ({ year: +m[1], month: +m[2], day: +m[3] }) },
  yyyymmdd_solid: { pattern: /(\d{4})(\d{2})(\d{2})(?![\d])/, parse: (m) => ({ year: +m[1], month: +m[2], day: +m[3] }) },

  // DDMMYYYY format: 13122024, 13-12-2024
  ddmmyyyy_dash: { pattern: /(\d{2})[\-_](\d{2})[\-_](\d{4})/, parse: (m) => ({ day: +m[1], month: +m[2], year: +m[3] }) },
  ddmmyyyy_solid: { pattern: /(\d{2})(\d{2})(\d{4})(?![\d])/, parse: (m) => ({ day: +m[1], month: +m[2], year: +m[3] }) }
};

async function log(message, ...args) {
  console.log(`📁 ${message}`, ...args);
}

async function error(message, ...args) {
  console.error(`❌ ${message}`, ...args);
}

async function success(message, ...args) {
  console.log(`✅ ${message}`, ...args);
}

async function warning(message, ...args) {
  console.log(`⚠️  ${message}`, ...args);
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function isDirectory(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

async function readManifest(manifestPath) {
  try {
    const content = await fs.readFile(manifestPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function isValidDate(day, month, year) {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
  // More precise day validation
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && 
         date.getMonth() === month - 1 && 
         date.getDate() === day;
}

function detectDateFromFilename(filename) {
  for (const [patternName, { pattern, parse }] of Object.entries(DATE_PATTERNS)) {
    const match = filename.match(pattern);
    if (match) {
      const dateInfo = parse(match);
      
      if (isValidDate(dateInfo.day, dateInfo.month, dateInfo.year)) {
        return {
          ...dateInfo,
          monthName: MONTHS[dateInfo.month - 1],
          iso: `${dateInfo.year}-${String(dateInfo.month).padStart(2, '0')}-${String(dateInfo.day).padStart(2, '0')}`,
          source: patternName
        };
      }
    }
  }
  return null;
}

function detectDateFromImages(imageFiles) {
  for (const filename of imageFiles) {
    const date = detectDateFromFilename(filename);
    if (date) {
      log(`Detected date from ${filename}: ${date.iso}`);
      return date;
    }
  }
  return null;
}

function getMonthYearFromDate(concertDate) {
  if (!concertDate || !concertDate.year || !concertDate.month) {
    return null;
  }
  
  const monthName = MONTHS[concertDate.month - 1];
  if (!monthName) {
    return null;
  }
  
  return `${monthName} ${concertDate.year}`;
}

async function generateManifest(folderPath, bandName, images, concertDate) {
  const manifest = {
    bandName: bandName,
    folderName: path.basename(folderPath),
    totalImages: images.length,
    images: images,
    metadata: {
      generated: new Date().toISOString(),
      version: "1.0"
    },
    concertDate: concertDate
  };
  
  const manifestPath = path.join(folderPath, 'manifest.json');
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  success(`Generated manifest: ${manifestPath}`);
  return manifest;
}

async function processDirectImageFolder(bandName, bandPath) {
  // Handle case where images are directly in the band folder (no subfolders)
  log(`Checking for direct images in ${bandName}`);
  
  try {
    const items = await fs.readdir(bandPath);
    const imageFiles = items.filter(item => IMAGE_EXTENSIONS.test(item));
    
    if (imageFiles.length === 0) {
      return false;
    }
    
    log(`Found ${imageFiles.length} images directly in ${bandName}`);
    
    // Detect date from image filenames
    const detectedDate = detectDateFromImages(imageFiles);
    
    if (!detectedDate) {
      warning(`Could not detect date from images in ${bandName}`);
      return false;
    }
    
    const monthYear = getMonthYearFromDate(detectedDate);
    const newFolderPath = path.join(bandPath, monthYear);
    
    log(`Creating new folder: ${bandName}/${monthYear}`);
    
    // Create the month year folder
    await fs.mkdir(newFolderPath, { recursive: true });
    
    // Move all images to the new folder
    for (const imageFile of imageFiles) {
      const oldPath = path.join(bandPath, imageFile);
      const newPath = path.join(newFolderPath, imageFile);
      await fs.rename(oldPath, newPath);
    }
    
    // Generate manifest for the new folder
    await generateManifest(newFolderPath, bandName, imageFiles, detectedDate);
    
    success(`Organized direct images: ${bandName} -> ${bandName}/${monthYear}`);
    return true;
    
  } catch (err) {
    error(`Failed to process direct images in ${bandName}:`, err.message);
    return false;
  }
}

async function organizeBandFolder(bandName, bandPath) {
  log(`Processing band: ${bandName}`);
  
  try {
    const items = await fs.readdir(bandPath);
    const subfolders = [];
    const imageFiles = items.filter(item => IMAGE_EXTENSIONS.test(item));
    
    // First, check if there are direct images that need organizing
    if (imageFiles.length > 0) {
      return await processDirectImageFolder(bandName, bandPath);
    }
    
    // Get all subfolders
    for (const item of items) {
      const itemPath = path.join(bandPath, item);
      if (await isDirectory(itemPath)) {
        subfolders.push({ name: item, path: itemPath });
      }
    }
    
    if (subfolders.length === 0) {
      log(`No subfolders or images found in ${bandName}`);
      return false;
    }
    
    // Check if already properly organized (has Month Year folders)
    const monthYearPattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/i;
    const hasMonthYearFolder = subfolders.some(folder => monthYearPattern.test(folder.name));
    
    if (hasMonthYearFolder) {
      log(`${bandName} already properly organized`);
      // Still check if any folders need manifests
      let generated = false;
      for (const subfolder of subfolders) {
        if (monthYearPattern.test(subfolder.name)) {
          const manifestPath = path.join(subfolder.path, 'manifest.json');
          if (!await exists(manifestPath)) {
            // Generate manifest for existing Month Year folder
            const folderItems = await fs.readdir(subfolder.path);
            const folderImages = folderItems.filter(item => IMAGE_EXTENSIONS.test(item));
            
            if (folderImages.length > 0) {
              const detectedDate = detectDateFromImages(folderImages);
              if (detectedDate) {
                await generateManifest(subfolder.path, bandName, folderImages, detectedDate);
                generated = true;
              }
            }
          }
        }
      }
      return generated;
    }
    
    // Look for folders that need reorganization
    let organized = false;
    
    for (const subfolder of subfolders) {
      const manifestPath = path.join(subfolder.path, 'manifest.json');
      
      // Try to use existing manifest first
      if (await exists(manifestPath)) {
        const manifest = await readManifest(manifestPath);
        
        if (manifest && manifest.concertDate) {
          const monthYear = getMonthYearFromDate(manifest.concertDate);
          
          if (monthYear && subfolder.name !== monthYear) {
            const newFolderPath = path.join(bandPath, monthYear);
            
            log(`Found manifest in ${subfolder.name}, organizing to "${monthYear}"`);
            
            // Check if target folder already exists
            if (await exists(newFolderPath)) {
              warning(`Target folder ${monthYear} already exists, skipping ${subfolder.name}`);
              continue;
            }
            
            // Rename/move the folder
            await fs.rename(subfolder.path, newFolderPath);
            success(`Moved ${bandName}/${subfolder.name} -> ${bandName}/${monthYear}`);
            organized = true;
            continue;
          }
        }
      }
      
      // No manifest found, try to detect date from images
      const folderItems = await fs.readdir(subfolder.path);
      const folderImages = folderItems.filter(item => IMAGE_EXTENSIONS.test(item));
      
      if (folderImages.length > 0) {
        const detectedDate = detectDateFromImages(folderImages);
        
        if (detectedDate) {
          const monthYear = getMonthYearFromDate(detectedDate);
          
          if (monthYear && subfolder.name !== monthYear) {
            const newFolderPath = path.join(bandPath, monthYear);
            
            log(`Detected date from images in ${subfolder.name}, organizing to "${monthYear}"`);
            
            // Check if target folder already exists
            if (await exists(newFolderPath)) {
              warning(`Target folder ${monthYear} already exists, skipping ${subfolder.name}`);
              continue;
            }
            
            // Rename/move the folder
            await fs.rename(subfolder.path, newFolderPath);
            
            // Generate manifest for the renamed folder
            await generateManifest(newFolderPath, bandName, folderImages, detectedDate);
            
            success(`Organized ${bandName}/${subfolder.name} -> ${bandName}/${monthYear}`);
            organized = true;
          } else if (monthYear && subfolder.name === monthYear) {
            // Folder already properly named, just ensure it has a manifest
            if (!await exists(manifestPath)) {
              await generateManifest(subfolder.path, bandName, folderImages, detectedDate);
              organized = true;
            }
          }
        } else {
          warning(`Could not detect date from images in ${subfolder.name}`);
        }
      }
    }
    
    if (!organized) {
      log(`No reorganization needed for ${bandName}`);
    }
    
    return organized;
    
  } catch (err) {
    error(`Failed to process ${bandName}:`, err.message);
    return false;
  }
}

async function organizeAllConcertFolders(dryRun = false) {
  log('Starting concert folder organization...');
  
  if (dryRun) {
    warning('DRY RUN MODE - No changes will be made');
  }
  
  try {
    if (!await exists(CONCERT_BASE)) {
      error(`Concert directory not found: ${CONCERT_BASE}`);
      return;
    }
    
    const bands = await fs.readdir(CONCERT_BASE);
    const bandFolders = [];
    
    for (const band of bands) {
      const bandPath = path.join(CONCERT_BASE, band);
      if (await isDirectory(bandPath) && !band.startsWith('.')) {
        bandFolders.push({ name: band, path: bandPath });
      }
    }
    
    log(`Found ${bandFolders.length} band folders`);
    
    if (bandFolders.length === 0) {
      warning('No band folders found');
      return;
    }
    
    let reorganized = 0;
    
    for (const band of bandFolders) {
      if (dryRun) {
        // In dry run, just analyze
        log(`[DRY RUN] Would process: ${band.name}`);
        // You could add more detailed analysis here
      } else {
        const wasReorganized = await organizeBandFolder(band.name, band.path);
        if (wasReorganized) {
          reorganized++;
        }
      }
    }
    
    if (!dryRun) {
      success(`Organization complete! Reorganized ${reorganized} band folder(s)`);
      
      if (reorganized > 0) {
        log('Regenerating manifests to update paths...');
        const { spawn } = require('child_process');
        
        const manifestProcess = spawn('node', ['scripts/enhanced-manifest-generator.js', '--auto'], {
          stdio: 'inherit',
          cwd: process.cwd()
        });
        
        manifestProcess.on('close', (code) => {
          if (code === 0) {
            success('Manifests regenerated successfully');
          } else {
            warning('Manifest regeneration may have failed');
          }
        });
      }
    }
    
  } catch (err) {
    error('Organization failed:', err.message);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('--dry');
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
🎸 Auto Concert Folder Organizer v2.0

Automatically organizes concert folders with intelligent features:

🔧 FEATURES:
  • Reorganizes existing folders: Band Name/Band Name/ → Band Name/Month Year/
  • Auto-detects dates from image filenames (DDMMYY, YYMMDD, YYYYMMDD formats)
  • Creates proper Month Year folders for new bands with direct images
  • Automatically generates manifests for all organized folders
  • Handles both existing reorganization and new folder creation

📋 USAGE:
  node scripts/auto-concert-folder-organizer.js [options]

⚙️  OPTIONS:
  --dry-run, --dry    Show what would be changed without making changes
  --help, -h          Show this help message

📁 EXAMPLES:
  # Organize all concert folders and generate manifests
  node scripts/auto-concert-folder-organizer.js
  
  # Preview what would be changed (safe)
  node scripts/auto-concert-folder-organizer.js --dry-run
  
  # Using npm scripts
  npm run organize:folders          # Organize folders
  npm run organize:folders-preview  # Preview changes

🎯 WHAT IT HANDLES:
  • New Band/image1.jpg, image2.jpg → Band/Month Year/image1.jpg, image2.jpg + manifest
  • Band/Band Name/images → Band/Month Year/images + manifest  
  • Band/random-folder/images → Band/Month Year/images + manifest
  • Generates missing manifests for existing Month Year folders
`);
  process.exit(0);
}

// Run the organizer
organizeAllConcertFolders(dryRun).catch(err => {
  error('Failed to run organizer:', err.message);
  process.exit(1);
});