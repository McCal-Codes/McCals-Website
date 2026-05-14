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
const readline = require('readline');
const { notify } = require('../utils/manifest-webhook');
const { dedupeImageEntries } = require('../utils/image-manifest-dedupe.js');

// Configuration
const JOURNALISM_DIR = path.resolve(__dirname, '../../src/images/Portfolios/Journalism');
const MASTER_MANIFEST = path.join(JOURNALISM_DIR, 'journalism-manifest.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Command line arguments
const args = process.argv.slice(2);
const FORCE_OVERWRITE = args.includes('--force');

async function log(message, ...args) {
  console.log(`📰 ${message} - generate-journalism-manifest-v2.js:38`, ...args);
}

async function success(message, ...args) {
  console.log(`✅ ${message} - generate-journalism-manifest-v2.js:42`, ...args);
}

async function warning(message, ...args) {
  console.log(`⚠️  ${message} - generate-journalism-manifest-v2.js:46`, ...args);
}

async function error(message, ...args) {
  console.error(`❌ ${message} - generate-journalism-manifest-v2.js:50`, ...args);
}

// Interactive prompt helper
function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return (question) => new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function askForDate(eventName, sampleImage) {
  const prompt = createPrompt();
  console.log(`\\n📅 Date needed for: ${eventName} - generate-journalism-manifest-v2.js:67`);
  if (sampleImage) {
    console.log(`Sample image: ${sampleImage} - generate-journalism-manifest-v2.js:69`);
  }
  const answer = await prompt('   Enter date (YYYY-MM-DD or MM/DD/YYYY): ');
  
  // Parse the date
  let parsed;
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(answer)) {
    parsed = answer;
  } else if (/^\\d{1,2}\/\\d{1,2}\/\\d{4}$/.test(answer)) {
    const [m, d, y] = answer.split('/');
    parsed = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  } else if (/^\\d{6}$/.test(answer)) {
    // YYMMDD format
    const year = 2000 + parseInt(answer.substring(0, 2));
    const month = answer.substring(2, 4);
    const day = answer.substring(4, 6);
    parsed = `${year}-${month}-${day}`;
  }
  
  if (parsed) {
    const date = new Date(parsed);
    if (!isNaN(date.getTime())) {
      return parsed;
    }
  }
  
  console.log('⚠️  Invalid date format, using today as fallback - generate-journalism-manifest-v2.js:95');
  return new Date().toISOString().split('T')[0];
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

function formatDateDisplay(dateIso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (!match) {
    return new Date(dateIso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

async function loadCaptions(eventDir) {
  const captionsPath = path.join(eventDir, 'captions.json');
  if (await exists(captionsPath)) {
    try {
      const content = await fs.readFile(captionsPath, 'utf-8');
      log(`Loaded captions for ${path.basename(eventDir)}`);
      return JSON.parse(content);
    } catch (error) {
      warning(`Invalid captions.json in ${path.basename(eventDir)}: ${error.message}`);
    }
  }
  return null;
}

function getCaptionForImage(captions, filename) {
  if (!captions) return null;
  if (captions[filename]) return captions[filename];

  const ext = path.extname(filename);
  const base = filename.slice(0, -ext.length);
  const alternateExtensions =
    ext.toLowerCase() === '.webp' ? ['.jpg', '.jpeg', '.png'] : ['.webp'];

  for (const alternateExt of alternateExtensions) {
    const alternate = `${base}${alternateExt}`;
    if (captions[alternate]) return captions[alternate];
  }

  return null;
}

async function processEvent(categoryName, eventName, eventDir, folderPathOverride) {
  log(`Processing event: ${categoryName}/${eventName}`);
  
  try {
    const items = await fs.readdir(eventDir);
    const imageFiles = dedupeImageEntries(items.filter(isImageFile));
    
    if (imageFiles.length === 0) {
      warning(`No images found in ${categoryName}/${eventName}`);
      return null;
    }
    
    // Load event metadata and per-image captions
    const metadata = await loadEventMetadata(eventDir);
    const captions = await loadCaptions(eventDir);

    // Extract date from first image or use metadata
    let eventDate = metadata?.date;
    let dateSource = metadata?.date ? 'metadata' : null;
    
    if (!eventDate) {
      for (const imageFile of imageFiles) {
        const dateFromFile = extractDateFromFilename(imageFile);
        if (dateFromFile) {
          eventDate = dateFromFile;
          dateSource = 'filename_extraction';
          break;
        }
      }
    }
    
    // Prompt user if no date found
    if (!eventDate) {
      eventDate = await askForDate(`${categoryName}/${eventName}`, imageFiles[0]);
      dateSource = 'user_input';
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
    
    // Create processed images, applying per-image captions where available
    const images = imageFiles.map(filename => {
      const perImage = getCaptionForImage(captions, filename);
      return {
        filename,
        path: filename,
        description: perImage?.description || metadata?.description || `${eventName} photography`,
        caption: perImage?.caption || metadata?.caption || `${eventName} - ${categoryName}`,
        tags,
      };
    });
    
    const eventObj = {
      eventName: cleanTitle(eventName),
      category: categoryName,
      tags: tags,
      folderPath: folderPathOverride || `${categoryName}/${eventName}`,
      eventDate: {
        iso: eventDate,
        source: dateSource
      },
      dateDisplay: formatDateDisplay(eventDate),
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
      const looseEvent = await processEvent(
        categoryName,
        `${categoryName} Portfolio`,
        categoryDir,
        categoryName,
      );
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
      console.warn('Failed to notify manifest webhook (journalism): - generate-journalism-manifest-v2.js:398', err && err.message);
    }
    
    success('Journalism manifest generated successfully!');
    success(`📄 File: ${MASTER_MANIFEST}`);
    success(`📊 Events: ${manifest.totalEvents}, Images: ${manifest.totalImages}`);
    
    // Show breakdown
    console.log('\n📋 Category Breakdown: - generate-journalism-manifest-v2.js:406');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`📂 ${category}: ${count} events - generate-journalism-manifest-v2.js:408`);
    });
    
    console.log('\n🏷️  Available Tags: - generate-journalism-manifest-v2.js:411');
    Array.from(allTags).forEach(tag => {
      const taggedEvents = allEvents.filter(event => event.tags.includes(tag));
      console.log(`• ${tag}: ${taggedEvents.length} events - generate-journalism-manifest-v2.js:414`);
    });
    
    const publishedEvents = allEvents.filter(event => event.published);
    if (publishedEvents.length > 0) {
      console.log(`\n📰 Published Work: ${publishedEvents.length} events - generate-journalism-manifest-v2.js:419`);
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
  • Auto date extraction from filenames (YYMMDD_ prefix)
  • Interactive date prompt when no date found in filenames
  • Publication metadata support
  • Event-based organization like concert widget

Date Extraction:
  Filenames with date prefix: 250912_EventName_IMG_001.jpg → Sep 12, 2025
  If no date prefix found, you will be prompted to enter the date.

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
