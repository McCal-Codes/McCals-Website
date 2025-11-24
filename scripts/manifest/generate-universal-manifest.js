#!/usr/bin/env node
// ...existing code...

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

const { detectDateFromImages, formatDisplayDate, createFallbackDate, MONTHS } = require('../utils/shared-date-parsing.js');
const { notify } = require('../utils/manifest-webhook');
const { resolveDateOverride } = require('../utils/date-overrides.js');
const PORTFOLIOS_BASE = path.join(process.cwd(), 'src', 'images', 'Portfolios');
const MANIFEST_OUTPUT = path.join(PORTFOLIOS_BASE, 'portfolio-manifest.json');
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|gif)$/i;

async function log(message, ...args) {
  console.log(`📸 ${message} - generate-universal-manifest.js:23`, ...args);
}

async function error(message, ...args) {
  console.error(`❌ ${message} - generate-universal-manifest.js:27`, ...args);
}

async function success(message, ...args) {
  console.log(`✅ ${message} - generate-universal-manifest.js:31`, ...args);
}

async function warning(message, ...args) {
  console.log(`⚠️  ${message} - generate-universal-manifest.js:35`, ...args);
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

// Date parsing functions now handled by shared-date-parsing module

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

function inferCategoryFromPath(portfolioType) {
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
      if (detectedDate) {
        log(`Detected date from images: ${detectedDate.iso}`);
      } else {
        log('No date detected from images, using fallback');
      }

      const folderKey = `${portfolioType}/${itemName}`;
      const override = resolveDateOverride([folderKey, itemName]);

      let date = detectedDate || createFallbackDate();
      if (override) {
        date = {
          ...date,
          ...override.date
        };
      }

      const dateDisplay = override ? override.dateDisplay : (date.display || formatDisplayDate(date));
      date.display = dateDisplay;

      const result = {
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
      // Add categoryInfo if relevant
      const slug = `${portfolioType}/${itemName}`.toLowerCase();
      if (slug.startsWith('animal/')) {
        const parts = result.folderPath.split('/');
        result.categoryInfo = {
          category: 'Animal',
          animalType: parts[1] || '',
          animalName: parts[2] || ''
        };
      } else if (slug.startsWith('landscape/')) {
        const parts = result.folderPath.split('/');
        result.categoryInfo = {
          category: 'Landscape',
          location: parts[1] || '',
          placeName: parts[2] || ''
        };
      } else if (slug === 'nature') {
        result.categoryInfo = { category: 'Nature' };
      }

      if (override && override.notes) {
        result.dateNotes = override.notes;
      }

      return result;
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

      const folderKey = `${portfolioType}/${itemName}/${subfolder.name}`;
      const override = resolveDateOverride([folderKey, `${itemName}/${subfolder.name}`, subfolder.name]);

      if (override) {
        date = {
          ...date,
          ...override.date
        };
      }

      const dateDisplay = override ? override.dateDisplay : (getDateDisplayFromFolder(subfolder.name) || `${date.monthName} ${date.year}`);
      date.display = dateDisplay;

      const result = {
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

      if (override && override.notes) {
        result.dateNotes = override.notes;
      }

      return result;
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
      version: "1.0.0",
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
    try {
      await notify('universal', { path: MANIFEST_OUTPUT, written: true });
    } catch (err) {
      console.warn('Failed to notify manifest webhook (universal):', err && err.message);
    }
    success(`Generated universal manifest: ${MANIFEST_OUTPUT}`);
    success(`Processed ${allItems.length} portfolio items with ${universalManifest.totalImages} total images`);
    
    // Log summary
    console.log('\n📋 Portfolio Summary: - generate-universal-manifest.js:405');
    Object.entries(portfolioSummary).forEach(([type, stats]) => {
      console.log(`• ${type}: ${stats.count} items, ${stats.totalImages} images - generate-universal-manifest.js:407`);
    });
    
    console.log('\n🏷️  Categories: - generate-universal-manifest.js:410');
    categories.forEach(category => {
      const categoryItems = allItems.filter(item => item.category === category);
      console.log(`• ${category}: ${categoryItems.length} items - generate-universal-manifest.js:413`);
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
