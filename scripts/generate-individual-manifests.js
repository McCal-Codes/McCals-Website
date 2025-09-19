#!/usr/bin/env node

/**
 * Individual Concert Manifest Generator
 * 
 * Creates individual manifest.json files in each band/date folder
 * when new images are added. This ensures each concert folder has
 * its own manifest file with metadata.
 * 
 * Usage: node scripts/generate-individual-manifests.js
 */

const fs = require('fs').promises;
const path = require('path');

const CONCERT_BASE = path.join(process.cwd(), 'images', 'Portfolios', 'Concert');
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Date detection patterns
const DATE_PATTERNS = {
  ddmmyy_dash: { pattern: /(\d{2})[\-_](\d{2})[\-_](\d{2})/, parse: (m) => ({ day: +m[1], month: +m[2], year: 2000 + (+m[3]) }) },
  ddmmyy_solid: { pattern: /(\d{2})(\d{2})(\d{2})(?![\d])/, parse: (m) => ({ day: +m[1], month: +m[2], year: 2000 + (+m[3]) }) },
  yymmdd_dash: { pattern: /(\d{2})[\-_](\d{2})[\-_](\d{2})/, parse: (m) => ({ year: 2000 + (+m[1]), month: +m[2], day: +m[3] }) },
  yymmdd_solid: { pattern: /(\d{2})(\d{2})(\d{2})(?![\d])/, parse: (m) => ({ year: 2000 + (+m[1]), month: +m[2], day: +m[3] }) },
  yyyymmdd_dash: { pattern: /(\d{4})[\-_](\d{2})[\-_](\d{2})/, parse: (m) => ({ year: +m[1], month: +m[2], day: +m[3] }) },
  yyyymmdd_solid: { pattern: /(\d{4})(\d{2})(\d{2})(?![\d])/, parse: (m) => ({ year: +m[1], month: +m[2], day: +m[3] }) },
  ddmmyyyy_dash: { pattern: /(\d{2})[\-_](\d{2})[\-_](\d{4})/, parse: (m) => ({ day: +m[1], month: +m[2], year: +m[3] }) },
  ddmmyyyy_solid: { pattern: /(\d{2})(\d{2})(\d{4})(?![\d])/, parse: (m) => ({ day: +m[1], month: +m[2], year: +m[3] }) }
};

async function log(message, ...args) {
  console.log(`🎸 ${message}`, ...args);
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

function isValidDate(day, month, year) {
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > 2100) return false;
  
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
      return date;
    }
  }
  return null;
}

function getDateDisplayFromFolder(folderName) {
  const monthYearPattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i;
  const match = folderName.match(monthYearPattern);
  
  if (match) {
    return folderName; // Use folder name as-is (e.g., "December 2024")
  }
  
  return null;
}

async function generateManifestForFolder(bandName, subfolderName, folderPath) {
  log(`Generating manifest for ${bandName}/${subfolderName}...`);
  
  try {
    const folderItems = await fs.readdir(folderPath);
    const imageFiles = folderItems.filter(item => IMAGE_EXTENSIONS.test(item));
    
    if (imageFiles.length === 0) {
      warning(`No images found in ${bandName}/${subfolderName}`);
      return false;
    }
    
    // Sort images
    imageFiles.sort();
    
    // Try to detect date from folder name or images
    let concertDate = null;
    
    // Try folder name first (e.g., "December 2024")
    const dateFromFolder = getDateDisplayFromFolder(subfolderName);
    if (dateFromFolder) {
      const monthYearMatch = subfolderName.match(/^(\w+)\s+(\d{4})$/);
      if (monthYearMatch) {
        const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === monthYearMatch[1].toLowerCase());
        if (monthIndex !== -1) {
          concertDate = {
            year: parseInt(monthYearMatch[2]),
            month: monthIndex + 1,
            monthName: MONTHS[monthIndex],
            day: 1, // Default to 1st of month
            iso: `${monthYearMatch[2]}-${String(monthIndex + 1).padStart(2, '0')}-01`
          };
          log(`Using date from folder name: ${concertDate.iso}`);
        }
      }
    }
    
    // Fallback: detect from image filenames
    if (!concertDate) {
      concertDate = detectDateFromImages(imageFiles);
      if (concertDate) {
        log(`Detected date from images: ${concertDate.iso}`);
      }
    }
    
    // Final fallback
    if (!concertDate) {
      const currentYear = new Date().getFullYear();
      concertDate = {
        year: currentYear,
        month: 1,
        monthName: 'January',
        day: 1,
        iso: `${currentYear}-01-01`
      };
      warning(`Could not detect date for ${bandName}/${subfolderName}, using default`);
    }
    
    const dateDisplay = getDateDisplayFromFolder(subfolderName) || `${concertDate.monthName} ${concertDate.year}`;
    
    // Create manifest data
    const manifest = {
      bandName: bandName,
      folderName: subfolderName,
      dateDisplay: dateDisplay,
      concertDate: concertDate,
      totalImages: imageFiles.length,
      images: imageFiles,
      generated: new Date().toISOString(),
      version: "1.0"
    };
    
    // Write manifest file
    const manifestPath = path.join(folderPath, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    
    success(`Created manifest: ${bandName}/${subfolderName}/manifest.json (${imageFiles.length} images)`);
    return true;
    
  } catch (err) {
    error(`Failed to generate manifest for ${bandName}/${subfolderName}:`, err.message);
    return false;
  }
}

async function processAllFolders() {
  log('Scanning for concert folders that need individual manifests...');
  
  try {
    if (!await exists(CONCERT_BASE)) {
      error(`Concert directory not found: ${CONCERT_BASE}`);
      return;
    }
    
    const bands = await fs.readdir(CONCERT_BASE);
    let processedCount = 0;
    let createdCount = 0;
    
    for (const band of bands) {
      const bandPath = path.join(CONCERT_BASE, band);
      
      // Skip non-directories and special files
      if (!await isDirectory(bandPath) || band.startsWith('.') || band.includes('.json')) {
        continue;
      }
      
      log(`Processing band: ${band}`);
      
      const subfolders = await fs.readdir(bandPath);
      
      for (const subfolder of subfolders) {
        const subfolderPath = path.join(bandPath, subfolder);
        
        if (!await isDirectory(subfolderPath) || subfolder.startsWith('.')) {
          continue;
        }
        
        processedCount++;
        
        // Check if manifest already exists and is recent
        const manifestPath = path.join(subfolderPath, 'manifest.json');
        let needsUpdate = true;
        
        if (await exists(manifestPath)) {
          try {
            const manifestStat = await fs.stat(manifestPath);
            const folderItems = await fs.readdir(subfolderPath);
            const imageFiles = folderItems.filter(item => IMAGE_EXTENSIONS.test(item));
            
            // Check if any images are newer than the manifest
            let hasNewerImages = false;
            for (const imageFile of imageFiles) {
              const imageStat = await fs.stat(path.join(subfolderPath, imageFile));
              if (imageStat.mtime > manifestStat.mtime) {
                hasNewerImages = true;
                break;
              }
            }
            
            if (!hasNewerImages) {
              log(`Manifest for ${band}/${subfolder} is up to date`);
              needsUpdate = false;
            }
          } catch (err) {
            log(`Could not check manifest age for ${band}/${subfolder}, will regenerate`);
          }
        }
        
        if (needsUpdate) {
          const created = await generateManifestForFolder(band, subfolder, subfolderPath);
          if (created) {
            createdCount++;
          }
        }
      }
    }
    
    success(`Individual manifest generation complete!`);
    log(`Processed ${processedCount} folders, created/updated ${createdCount} manifests`);
    
  } catch (err) {
    error('Failed to process folders:', err.message);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
🎸 Individual Concert Manifest Generator

Creates individual manifest.json files in each band/date folder
when images are added or updated.

Usage:
  node scripts/generate-individual-manifests.js

Features:
  • Scans all band folders recursively
  • Creates manifest.json in each subfolder with images
  • Detects dates from folder names or image filenames  
  • Only updates manifests when images are newer
  • Perfect complement to the master manifest generator

Examples:
  node scripts/generate-individual-manifests.js
  npm run manifests:individual
`);
  process.exit(0);
}

// Run the generator
processAllFolders().catch(err => {
  error('Failed to run individual manifest generator:', err.message);
  process.exit(1);
});