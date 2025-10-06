#!/usr/bin/env node

/**
 * Concert Master Manifest Generator
 * 
 * Generates a single master manifest file for the concert widget to use.
 * This reduces API calls from dozens to just ONE for the widget.
 * 
 * Automatically scans all concert folders and creates:
 * - images/Portfolios/Concert/concert-manifest.json
 */

const fs = require('fs').promises;
const path = require('path');
const { detectDateFromFilename, detectDateFromImages, formatDisplayDate, createFallbackDate } = require('../utils/shared-date-parsing.js');

const CONCERT_BASE = path.join(process.cwd(), 'src', 'images', 'Portfolios', 'Concert');
const MANIFEST_OUTPUT = path.join(CONCERT_BASE, 'concert-manifest.json');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

// Date parsing functions moved to shared-date-parsing.js module

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

// Date detection functions moved to shared-date-parsing.js module
// Use detectDateFromFilename() and detectDateFromImages() from shared module

function getDateDisplayFromFolder(folderName) {
  // Try to extract "Month Year" from folder name
  const monthYearPattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i;
  const match = folderName.match(monthYearPattern);
  
  if (match) {
    return folderName; // Use folder name as-is (e.g., "December 2024")
  }
  
  return null;
}

async function processBand(bandName, bandPath) {
  log(`Processing band: ${bandName}`);
  
  try {
    const items = await fs.readdir(bandPath);
    const subfolders = [];
    
    for (const item of items) {
      const itemPath = path.join(bandPath, item);
      if (await isDirectory(itemPath)) {
        subfolders.push({ name: item, path: itemPath });
      }
    }
    
    if (subfolders.length === 0) {
      warning(`No subfolders found in ${bandName}`);
      return [];
    }
    
    const concertDates = [];
    
    // Process ALL subfolders, not just the first one
    for (const subfolder of subfolders) {
      const folderItems = await fs.readdir(subfolder.path);
      const imageFiles = folderItems.filter(item => IMAGE_EXTENSIONS.test(item));
      
      if (imageFiles.length === 0) {
        continue; // Skip folders with no images
      }
      
      log(`Found ${imageFiles.length} images in ${bandName}/${subfolder.name}`);
      
      // Try to get date from existing manifest first
      const manifestPath = path.join(subfolder.path, 'manifest.json');
      let concertDate = null;
      
      if (await exists(manifestPath)) {
        const manifest = await readManifest(manifestPath);
        if (manifest && manifest.concertDate) {
          concertDate = manifest.concertDate;
          log(`Using date from manifest: ${concertDate.iso}`);
        }
      }
      
      // Fallback: try to detect date from folder name or images
      if (!concertDate) {
        // Try folder name first (e.g., "December 2024")
        const dateFromFolder = getDateDisplayFromFolder(subfolder.name);
        if (dateFromFolder) {
          // Parse the folder name to get proper date info
          const monthYearMatch = subfolder.name.match(/^(\w+)\s+(\d{4})$/);
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
        
        // Still no date? Try to detect from image filenames
        if (!concertDate) {
          concertDate = detectDateFromImages(imageFiles);
          if (concertDate) {
            log(`Detected date from images: ${concertDate.iso}`);
          }
        }
      }
      
      // Default fallback
      if (!concertDate) {
        const currentYear = new Date().getFullYear();
        concertDate = {
          year: currentYear,
          month: 1,
          monthName: 'January',
          day: 1,
          iso: `${currentYear}-01-01`
        };
        warning(`Could not detect date for ${bandName}/${subfolder.name}, using default`);
      }
      
      const dateDisplay = getDateDisplayFromFolder(subfolder.name) || `${concertDate.monthName} ${concertDate.year}`;
      
      concertDates.push({
        bandName: bandName,
        folderPath: `${bandName}/${subfolder.name}`,
        dateDisplay: dateDisplay,
        concertDate: concertDate,
        totalImages: imageFiles.length,
        images: imageFiles.sort() // Sort filenames
      });
    }
    
    if (concertDates.length === 0) {
      warning(`No valid subfolders with images found in ${bandName}`);
    }
    
    return concertDates;
    
  } catch (err) {
    error(`Failed to process ${bandName}:`, err.message);
    return [];
  }
}

async function generateMasterManifest() {
  log('Generating master concert manifest...');
  
  try {
    if (!await exists(CONCERT_BASE)) {
      error(`Concert directory not found: ${CONCERT_BASE}`);
      return;
    }
    
    const bands = await fs.readdir(CONCERT_BASE);
    const bandFolders = [];
    
    for (const band of bands) {
      const bandPath = path.join(CONCERT_BASE, band);
      if (await isDirectory(bandPath) && !band.startsWith('.') && band !== 'concert-manifest.json') {
        bandFolders.push({ name: band, path: bandPath });
      }
    }
    
    log(`Found ${bandFolders.length} band folders`);
    
    if (bandFolders.length === 0) {
      warning('No band folders found');
      return;
    }
    
    const processedBands = [];
    
    for (const band of bandFolders) {
      const results = await processBand(band.name, band.path);
      if (results && results.length > 0) {
        processedBands.push(...results); // Spread all concert dates
      }
    }
    
    // Sort bands by date (newest first)
    processedBands.sort((a, b) => new Date(b.concertDate.iso) - new Date(a.concertDate.iso));
    
    const masterManifest = {
      version: "1.0",
      generated: new Date().toISOString(),
      totalBands: processedBands.length,
      bands: processedBands
    };
    
    // Write the master manifest
    await fs.writeFile(MANIFEST_OUTPUT, JSON.stringify(masterManifest, null, 2), 'utf8');
    success(`Generated master manifest: ${MANIFEST_OUTPUT}`);
    success(`Processed ${processedBands.length} bands with ${processedBands.reduce((total, band) => total + band.totalImages, 0)} total images`);
    
    // Log summary
    console.log('\n📋 Summary:');
    processedBands.forEach(band => {
      console.log(`   • ${band.bandName} (${band.dateDisplay}) - ${band.totalImages} images`);
    });
    
  } catch (err) {
    error('Failed to generate master manifest:', err.message);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
🎸 Concert Master Manifest Generator

Generates a single master manifest file for the concert widget.
This reduces widget API calls from dozens to just ONE.

Usage:
  node scripts/generate-concert-manifest.js

Output:
  Creates: images/Portfolios/Concert/concert-manifest.json

Features:
  • Scans all band folders automatically
  • Detects dates from manifests, folder names, or image filenames
  • Sorts bands by concert date (newest first)
  • Perfect for rate-limited environments like Squarespace

Examples:
  node scripts/generate-concert-manifest.js
  npm run manifest:concert
`);
  process.exit(0);
}

// Generate the manifest
generateMasterManifest().catch(err => {
  error('Failed to run generator:', err.message);
  process.exit(1);
});