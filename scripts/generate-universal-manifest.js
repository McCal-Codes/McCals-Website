#!/usr/bin/env node

/**
 * Universal Portfolio Manifest Generator
 * 
 * Generates a single master manifest for ALL portfolios (Concert, Journalism, Events, etc.)
 * This enables a universal portfolio widget with just ONE API call.
 * 
 * Scans: images/Portfolios/*
 * Creates: images/Portfolios/portfolio-manifest.json
 */

const fs = require('fs').promises;
const path = require('path');

const PORTFOLIOS_BASE = path.join(process.cwd(), 'images', 'Portfolios');
const MANIFEST_OUTPUT = path.join(PORTFOLIOS_BASE, 'portfolio-manifest.json');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

// Date detection patterns (same as concert organizer)
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
  console.log(`📸 ${message}`, ...args);
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
  // Try to extract "Month Year" from folder name
  const monthYearPattern = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})$/i;
  const match = folderName.match(monthYearPattern);
  
  if (match) {
    return folderName; // Use folder name as-is
  }
  
  return null;
}

function cleanTitle(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function inferCategoryFromPath(portfolioType, itemName) {
  // Map portfolio types to categories
  const categoryMap = {
    'Concert': 'Concert Photography',
    'Journalism': 'Journalism',
    'Event': 'Event Photography',
    'Events': 'Event Photography',
    'Portrait': 'Portrait Photography',
    'Portraits': 'Portrait Photography',
    'Wedding': 'Wedding Photography',
    'Weddings': 'Wedding Photography',
    'Street': 'Street Photography',
    'Nature': 'Nature Photography',
    'Architecture': 'Architecture Photography'
  };

  return categoryMap[portfolioType] || `${cleanTitle(portfolioType)} Photography`;
}

async function processPortfolioItem(portfolioType, itemName, itemPath) {
  log(`Processing ${portfolioType}/${itemName}`);
  
  try {
    const items = await fs.readdir(itemPath);
    const subfolders = [];
    const imageFiles = items.filter(item => IMAGE_EXTENSIONS.test(item));
    
    // Check for direct images first
    if (imageFiles.length > 0) {
      log(`Found ${imageFiles.length} direct images in ${itemName}`);
      
      const detectedDate = detectDateFromImages(imageFiles);
      const currentYear = new Date().getFullYear();
      
      const fallbackDate = {
        year: currentYear,
        month: 1,
        monthName: 'January',
        day: 1,
        iso: `${currentYear}-01-01`
      };
      
      const date = detectedDate || fallbackDate;
      const dateDisplay = `${date.monthName} ${date.year}`;
      
      return {
        type: portfolioType,
        category: inferCategoryFromPath(portfolioType, itemName),
        name: cleanTitle(itemName),
        folderPath: `${portfolioType}/${itemName}`,
        dateDisplay: dateDisplay,
        date: date,
        totalImages: imageFiles.length,
        images: imageFiles.sort(),
        coverImage: imageFiles[0]
      };
    }
    
    // Look for subfolders
    for (const item of items) {
      const subPath = path.join(itemPath, item);
      if (await isDirectory(subPath)) {
        subfolders.push({ name: item, path: subPath });
      }
    }
    
    if (subfolders.length === 0) {
      warning(`No images or subfolders found in ${portfolioType}/${itemName}`);
      return null;
    }
    
    // Process subfolders (like Concert/Band/Month Year structure)
    for (const subfolder of subfolders) {
      const folderItems = await fs.readdir(subfolder.path);
      const folderImages = folderItems.filter(item => IMAGE_EXTENSIONS.test(item));
      
      if (folderImages.length === 0) {
        continue; // Skip folders with no images
      }
      
      log(`Found ${folderImages.length} images in ${itemName}/${subfolder.name}`);
      
      // Try to get date from existing manifest first
      const manifestPath = path.join(subfolder.path, 'manifest.json');
      let date = null;
      
      if (await exists(manifestPath)) {
        const manifest = await readManifest(manifestPath);
        if (manifest && manifest.concertDate) {
          date = manifest.concertDate;
          log(`Using date from manifest: ${date.iso}`);
        }
      }
      
      // Fallback: try to detect date from folder name or images
      if (!date) {
        const dateFromFolder = getDateDisplayFromFolder(subfolder.name);
        if (dateFromFolder) {
          const monthYearMatch = subfolder.name.match(/^(\w+)\s+(\d{4})$/);
          if (monthYearMatch) {
            const monthIndex = MONTHS.findIndex(m => m.toLowerCase() === monthYearMatch[1].toLowerCase());
            if (monthIndex !== -1) {
              date = {
                year: parseInt(monthYearMatch[2]),
                month: monthIndex + 1,
                monthName: MONTHS[monthIndex],
                day: 1,
                iso: `${monthYearMatch[2]}-${String(monthIndex + 1).padStart(2, '0')}-01`
              };
              log(`Using date from folder name: ${date.iso}`);
            }
          }
        }
        
        // Still no date? Try to detect from image filenames
        if (!date) {
          date = detectDateFromImages(folderImages);
          if (date) {
            log(`Detected date from images: ${date.iso}`);
          }
        }
      }
      
      // Default fallback
      if (!date) {
        const currentYear = new Date().getFullYear();
        date = {
          year: currentYear,
          month: 1,
          monthName: 'January',
          day: 1,
          iso: `${currentYear}-01-01`
        };
        warning(`Could not detect date for ${itemName}/${subfolder.name}, using default`);
      }
      
      const dateDisplay = getDateDisplayFromFolder(subfolder.name) || `${date.monthName} ${date.year}`;
      
      return {
        type: portfolioType,
        category: inferCategoryFromPath(portfolioType, itemName),
        name: cleanTitle(itemName),
        folderPath: `${portfolioType}/${itemName}/${subfolder.name}`,
        dateDisplay: dateDisplay,
        date: date,
        totalImages: folderImages.length,
        images: folderImages.sort(),
        coverImage: folderImages[0]
      };
    }
    
    warning(`No valid subfolders with images found in ${portfolioType}/${itemName}`);
    return null;
    
  } catch (err) {
    error(`Failed to process ${portfolioType}/${itemName}:`, err.message);
    return null;
  }
}

async function processPortfolioType(portfolioType, portfolioPath) {
  log(`Processing portfolio type: ${portfolioType}`);
  
  try {
    const items = await fs.readdir(portfolioPath);
    const itemFolders = [];
    const directImages = items.filter(item => IMAGE_EXTENSIONS.test(item));
    
    // Check for direct images in the portfolio type folder (like Journalism)
    if (directImages.length > 0) {
      log(`Found ${directImages.length} direct images in ${portfolioType}`);
      
      const detectedDate = detectDateFromImages(directImages);
      const currentYear = new Date().getFullYear();
      
      const fallbackDate = {
        year: currentYear,
        month: 1,
        monthName: 'January',
        day: 1,
        iso: `${currentYear}-01-01`
      };
      
      const date = detectedDate || fallbackDate;
      const dateDisplay = detectedDate ? `${date.monthName} ${date.year}` : `${portfolioType} Portfolio`;
      
      return [{
        type: portfolioType,
        category: inferCategoryFromPath(portfolioType, portfolioType),
        name: `${portfolioType} Portfolio`,
        folderPath: portfolioType,
        dateDisplay: dateDisplay,
        date: date,
        totalImages: directImages.length,
        images: directImages.sort(),
        coverImage: directImages[0]
      }];
    }
    
    // Otherwise, look for subfolders
    for (const item of items) {
      const itemPath = path.join(portfolioPath, item);
      if (await isDirectory(itemPath) && !item.startsWith('.') && !item.endsWith('.json')) {
        itemFolders.push({ name: item, path: itemPath });
      }
    }
    
    log(`Found ${itemFolders.length} items in ${portfolioType}`);
    
    const processedItems = [];
    
    for (const item of itemFolders) {
      const result = await processPortfolioItem(portfolioType, item.name, item.path);
      if (result) {
        processedItems.push(result);
      }
    }
    
    return processedItems;
    
  } catch (err) {
    error(`Failed to process portfolio type ${portfolioType}:`, err.message);
    return [];
  }
}

async function generateUniversalManifest() {
  log('Generating universal portfolio manifest...');
  
  try {
    if (!await exists(PORTFOLIOS_BASE)) {
      error(`Portfolios directory not found: ${PORTFOLIOS_BASE}`);
      return;
    }
    
    const portfolioTypes = await fs.readdir(PORTFOLIOS_BASE);
    const validPortfolioTypes = [];
    
    for (const type of portfolioTypes) {
      const typePath = path.join(PORTFOLIOS_BASE, type);
      if (await isDirectory(typePath) && !type.startsWith('.') && !type.endsWith('.json')) {
        validPortfolioTypes.push({ name: type, path: typePath });
      }
    }
    
    log(`Found ${validPortfolioTypes.length} portfolio types:`, validPortfolioTypes.map(t => t.name));
    
    if (validPortfolioTypes.length === 0) {
      warning('No portfolio types found');
      return;
    }
    
    const allItems = [];
    const portfolioSummary = {};
    
    for (const portfolioType of validPortfolioTypes) {
      const items = await processPortfolioType(portfolioType.name, portfolioType.path);
      allItems.push(...items);
      
      portfolioSummary[portfolioType.name] = {
        count: items.length,
        totalImages: items.reduce((sum, item) => sum + item.totalImages, 0)
      };
    }
    
    // Sort all items by date (newest first)
    allItems.sort((a, b) => new Date(b.date.iso) - new Date(a.date.iso));
    
    // Get all unique categories
    const categories = [...new Set(allItems.map(item => item.category))].sort();
    
    const universalManifest = {
      version: "1.0",
      generated: new Date().toISOString(),
      totalPortfolios: validPortfolioTypes.length,
      totalItems: allItems.length,
      totalImages: allItems.reduce((sum, item) => sum + item.totalImages, 0),
      categories: categories,
      portfolioSummary: portfolioSummary,
      items: allItems
    };
    
    // Write the universal manifest
    await fs.writeFile(MANIFEST_OUTPUT, JSON.stringify(universalManifest, null, 2), 'utf8');
    success(`Generated universal manifest: ${MANIFEST_OUTPUT}`);
    success(`Processed ${allItems.length} portfolio items with ${universalManifest.totalImages} total images`);
    
    // Log summary
    console.log('\n📋 Portfolio Summary:');
    Object.entries(portfolioSummary).forEach(([type, stats]) => {
      console.log(`   • ${type}: ${stats.count} items, ${stats.totalImages} images`);
    });
    
    console.log('\n🏷️  Categories:');
    categories.forEach(category => {
      const categoryItems = allItems.filter(item => item.category === category);
      console.log(`   • ${category}: ${categoryItems.length} items`);
    });
    
  } catch (err) {
    error('Failed to generate universal manifest:', err.message);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
📸 Universal Portfolio Manifest Generator

Generates a single master manifest for ALL portfolio types.
This enables a universal portfolio widget with just ONE API call.

Usage:
  node scripts/generate-universal-manifest.js

Output:
  Creates: images/Portfolios/portfolio-manifest.json

Features:
  • Scans ALL portfolio types (Concert, Journalism, Events, etc.)
  • Detects dates from manifests, folder names, or image filenames
  • Categorizes items automatically
  • Sorts by date (newest first)
  • Perfect for universal portfolio widgets

Examples:
  node scripts/generate-universal-manifest.js
  npm run manifest:universal
`);
  process.exit(0);
}

// Generate the universal manifest
generateUniversalManifest().catch(err => {
  error('Failed to run generator:', err.message);
  process.exit(1);
});