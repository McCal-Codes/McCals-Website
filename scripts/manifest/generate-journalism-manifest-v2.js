#!/usr/bin/env node

/**
 * Enhanced Journalism Portfolio Manifest Generator v2.0
 * 
 * Direct folder-based system (no import folder needed):
 * - Create: Journalism/Politics/Clinton Rally/
 * - Drop photos directly in event folders
 * - Add tags.json for multi-tagging (including "Published Work")
 * - Auto-generates manifest from folder structure
 * 
 * Features:
 * - Multi-tagging support (photos can have multiple tags)
 * - "Published Work" tag support
 * - Event-based organization like concert widget
 * - Metadata support for each event
 * 
 * Usage:
 *   node scripts/generate-journalism-manifest-v2.js
 *   npm run manifest:journalism
 */

const fs = require('fs').promises;
const path = require('path');
const { notify } = require('../utils/manifest-webhook');

// Configuration
const JOURNALISM_DIR = path.resolve(__dirname, '../../src/images/Portfolios/Journalism');
const MASTER_MANIFEST = path.join(JOURNALISM_DIR, 'journalism-manifest.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Command line arguments
const args = process.argv.slice(2);
const FORCE_OVERWRITE = args.includes('--force');

async function log(message, ...args) {
  console.log(`📰 ${message} - generate-journalism-manifest-v2.js:36`, ...args);
}

async function success(message, ...args) {
  console.log(`✅ ${message} - generate-journalism-manifest-v2.js:40`, ...args);
}

async function warning(message, ...args) {
  console.log(`⚠️  ${message} - generate-journalism-manifest-v2.js:44`, ...args);
}

async function error(message, ...args) {
  console.error(`❌ ${message} - generate-journalism-manifest-v2.js:48`, ...args);
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

function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

function cleanTitle(name) {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

function extractDateFromFilename(filename) {
  // Try to extract YYMMDD from filename
  const patterns = [
    /(\d{6})_/, // 241029_EventName_
    /(\d{6})-/, // 241029-EventName-
    /^(\d{6})/ // 241029EventName
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      const dateStr = match[1];
      const year = 2000 + parseInt(dateStr.substring(0, 2));
      const month = parseInt(dateStr.substring(2, 4));
      const day = parseInt(dateStr.substring(4, 6));
      
      // Validate date
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
          return date.toISOString().split('T')[0];
        }
      }
    }
  }
  
  return null;
}

async function loadEventMetadata(eventDir) {
  const metadataPath = path.join(eventDir, 'tags.json');
  
  if (await exists(metadataPath)) {
    try {
      const content = await fs.readFile(metadataPath, 'utf-8');
      const metadata = JSON.parse(content);
      log(`Loaded metadata for ${path.basename(eventDir)}`);
      return metadata;
    } catch (error) {
      warning(`Invalid tags.json in ${path.basename(eventDir)}: ${error.message}`);
    }
  }
  
  return null;
}

async function processEvent(categoryName, eventName, eventDir) {
  log(`Processing event: ${categoryName}/${eventName}`);
  
  try {
    const items = await fs.readdir(eventDir);
    const imageFiles = items.filter(isImageFile);
    
    if (imageFiles.length === 0) {
      warning(`No images found in ${categoryName}/${eventName}`);
      return null;
    }
    
    // Load event metadata
    const metadata = await loadEventMetadata(eventDir);
    
    // Extract date from first image or use metadata
    let eventDate = metadata?.date;
    if (!eventDate) {
      for (const imageFile of imageFiles) {
        const dateFromFile = extractDateFromFilename(imageFile);
        if (dateFromFile) {
          eventDate = dateFromFile;
          break;
        }
      }
    }
    
    // Fallback to current date
    if (!eventDate) {
      eventDate = new Date().toISOString().split('T')[0];
      warning(`No date found for ${categoryName}/${eventName}, using current date`);
    }
    
    // Determine tags
    let tags = [categoryName]; // Always include the folder category
    
    if (metadata?.tags) {
      // Add custom tags from metadata
      tags = [...new Set([...tags, ...metadata.tags])];
    }
    
    // Check if marked as published
    const isPublished = metadata?.published === true || tags.includes('Published Work');
    if (isPublished && !tags.includes('Published Work')) {
      tags.push('Published Work');
    }
    
    // Create processed images
    const images = imageFiles.map(filename => ({
      filename,
      path: filename, // Use just filename, not full path
      description: metadata?.description || `${eventName} photography`,
      caption: metadata?.caption || `${eventName} - ${categoryName}`,
      tags: tags
    }));
    
    const eventObj = {
      eventName: cleanTitle(eventName),
      category: categoryName,
      tags: tags,
      folderPath: `${categoryName}/${eventName}`,
      eventDate: {
        iso: eventDate,
        source: metadata?.date ? 'metadata' : 'filename_extraction'
      },
      dateDisplay: new Date(eventDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      totalImages: imageFiles.length,
      images: images.sort((a, b) => a.filename.localeCompare(b.filename)),
      published: isPublished,
      metadata: metadata || {}
    };
    // Add categoryInfo if relevant

    
    // Add publication info if available
    if (metadata?.outlet) {
      eventObj.outlet = metadata.outlet;
      eventObj.outletUrl = metadata.outletUrl;
      eventObj.articleUrl = metadata.articleUrl;
      eventObj.articleTitle = metadata.articleTitle;
      eventObj.publishedDate = metadata.publishedDate;
    }
    
    log(`✓ ${eventName}: ${imageFiles.length} images, tags: [${tags.join(', ')}]`);
    return eventObj;
    
  } catch (err) {
    error(`Failed to process ${categoryName}/${eventName}:`, err.message);
    return null;
  }
}

async function processCategory(categoryName, categoryDir) {
  log(`Processing category: ${categoryName}`);
  
  try {
    const items = await fs.readdir(categoryDir);
    const events = [];
    
    // Look for direct images (loose files) in category
    const directImages = items.filter(isImageFile);
    if (directImages.length > 0) {
      log(`Found ${directImages.length} direct images in ${categoryName}`);
      
      // Create a virtual event for loose files
      const looseEvent = await processEvent(categoryName, `${categoryName} Portfolio`, categoryDir);
      if (looseEvent) {
        events.push(looseEvent);
      }
    }
    
    // Process event folders
    for (const item of items) {
      const itemPath = path.join(categoryDir, item);
      if (await isDirectory(itemPath) && !item.startsWith('.') && item !== 'tags.json') {
        const event = await processEvent(categoryName, item, itemPath);
        if (event) {
          events.push(event);
        }
      }
    }
    
    return events;
    
  } catch (err) {
    error(`Failed to process category ${categoryName}:`, err.message);
    return [];
  }
}

async function generateManifest() {
  log('Generating journalism manifest v2.0...');
  
  try {
    if (!await exists(JOURNALISM_DIR)) {
      error(`Journalism directory not found: ${JOURNALISM_DIR}`);
      return;
    }
    
    // Check if manifest already exists
    if (await exists(MASTER_MANIFEST) && !FORCE_OVERWRITE) {
      log('Manifest already exists. Use --force to overwrite.');
      return;
    }
    
    const items = await fs.readdir(JOURNALISM_DIR);
    const allEvents = [];
    const allTags = new Set();
    const categoryStats = {};
    
    // Process each category folder
    for (const item of items) {
      const itemPath = path.join(JOURNALISM_DIR, item);
      
      if (await isDirectory(itemPath) && !item.startsWith('.') && !item.endsWith('.json')) {
        const events = await processCategory(item, itemPath);
        allEvents.push(...events);
        
        // Track stats
        categoryStats[item] = events.length;
        
        // Collect all tags
        events.forEach(event => {
          event.tags.forEach(tag => allTags.add(tag));
        });
      }
    }
    
    if (allEvents.length === 0) {
      warning('No events found in journalism directory');
      return;
    }
    
    // Sort events by date (newest first)
    allEvents.sort((a, b) => new Date(b.eventDate.iso) - new Date(a.eventDate.iso));
    
    const manifest = {
      version: '2.0.0',
      generated: new Date().toISOString(),
      totalEvents: allEvents.length,
      totalImages: allEvents.reduce((sum, event) => sum + event.totalImages, 0),
      categories: Object.keys(categoryStats).sort(),
      tags: Array.from(allTags).sort(),
      categoryStats,
      events: allEvents
    };
    
    // Write manifest
    await fs.writeFile(MASTER_MANIFEST, JSON.stringify(manifest, null, 2), 'utf-8');
    try {
      await notify('journalism', { path: MASTER_MANIFEST, written: true });
    } catch (err) {
      console.warn('Failed to notify manifest webhook (journalism):', err && err.message);
    }
    
    success('Journalism manifest generated successfully!');
    success(`📄 File: ${MASTER_MANIFEST}`);
    success(`📊 Events: ${manifest.totalEvents}, Images: ${manifest.totalImages}`);
    
    // Show breakdown
    console.log('\n📋 Category Breakdown: - generate-journalism-manifest-v2.js:325');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`📂 ${category}: ${count} events - generate-journalism-manifest-v2.js:327`);
    });
    
    console.log('\n🏷️  Available Tags: - generate-journalism-manifest-v2.js:330');
    Array.from(allTags).forEach(tag => {
      const taggedEvents = allEvents.filter(event => event.tags.includes(tag));
      console.log(`• ${tag}: ${taggedEvents.length} events - generate-journalism-manifest-v2.js:333`);
    });
    
    const publishedEvents = allEvents.filter(event => event.published);
    if (publishedEvents.length > 0) {
      console.log(`\n📰 Published Work: ${publishedEvents.length} events - generate-journalism-manifest-v2.js:338`);
    }
    
  } catch (err) {
    error('Failed to generate manifest:', err.message);
    process.exit(1);
  }
}

// CLI handling
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
📰 Journalism Portfolio Manifest Generator v2.0

Direct folder-based system with multi-tagging support.

Usage:
  node scripts/generate-journalism-manifest-v2.js [--force]

Folder Structure:
  Journalism/
  ├── Politics/
  │   ├── Clinton Rally/
  │   │   ├── photo1.jpg
  │   │   ├── photo2.jpg
  │   │   └── tags.json (optional)
  │   └── City Council/
  │       └── meeting.jpg
  └── Events/
      └── Tech Conference/
          └── speaker.jpg

Multi-Tagging with tags.json:
{
  "tags": ["Politics", "Published Work", "Featured"],
  "published": true,
  "date": "2024-10-29",
  "description": "Clinton campaign rally coverage",
  "caption": "Presidential campaign event",
  "outlet": "New York Post",
  "outletUrl": "https://nypost.com",
  "articleUrl": "https://nypost.com/article-link",
  "articleTitle": "Clinton Rallies Pittsburgh Voters"
}

Features:
  • Direct folder organization (no import folder)
  • Multi-tagging support through tags.json
  • "Published Work" tag for published photos
  • Auto date extraction from filenames
  • Publication metadata support
  • Event-based organization like concert widget

Options:
  --force    Overwrite existing manifest
  --help     Show this help message
`);
  process.exit(0);
}

// Generate the manifest
generateManifest().catch(err => {
  error('Failed to run generator:', err.message);
  process.exit(1);
});