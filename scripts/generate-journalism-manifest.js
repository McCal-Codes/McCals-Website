#!/usr/bin/env node

/**
 * Journalism Portfolio Master Manifest Generator
 * Creates a master manifest similar to concert portfolio for efficient loading
 * 
 * Features:
 * - Single consolidated JSON for all journalism images
 * - Category-based organization (Politics, Events, Portraits, etc.)
 * - Publication metadata tracking
 * - Optimized for widget performance
 * - Compatible with existing individual manifest.json
 * 
 * Usage:
 *   node scripts/generate-journalism-manifest.js
 *   node scripts/generate-journalism-manifest.js --force  # Overwrite existing
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const JOURNALISM_DIR = path.join(__dirname, '../src/images/Portfolios/Journalism');
const INDIVIDUAL_MANIFEST = path.join(JOURNALISM_DIR, 'manifest.json');
const MASTER_MANIFEST = path.join(JOURNALISM_DIR, 'journalism-manifest.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const CATEGORIES = ['Politics', 'Events', 'Portraits', 'Featured', 'Published'];

// Command line arguments
const args = process.argv.slice(2);
const FORCE_OVERWRITE = args.includes('--force');

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🔍 Journalism Portfolio Master Manifest Generator v2.0');
    console.log(`📁 Scanning: ${JOURNALISM_DIR}`);
    
    // Check if journalism directory exists
    if (!await exists(JOURNALISM_DIR)) {
      console.error(`❌ Journalism directory not found: ${JOURNALISM_DIR}`);
      process.exit(1);
    }
    
    // Check if master manifest already exists
    if (await exists(MASTER_MANIFEST) && !FORCE_OVERWRITE) {
      console.log('📄 Master manifest already exists. Use --force to overwrite.');
      process.exit(0);
    }
    
    // Discover all journalism images
    const images = await discoverImages(JOURNALISM_DIR);
    console.log(`📸 Found ${images.length} journalism images`);
    
    if (images.length === 0) {
      console.log('⚠️  No images found in journalism directory');
      process.exit(0);
    }
    
    // Load existing individual manifest for metadata
    let individualManifest = {};
    if (await exists(INDIVIDUAL_MANIFEST)) {
      try {
        const content = await fs.readFile(INDIVIDUAL_MANIFEST, 'utf-8');
        individualManifest = JSON.parse(content);
        console.log('📋 Loaded existing individual manifest data');
      } catch (error) {
        console.warn('⚠️  Could not parse individual manifest');
      }
    }
    
    // Process and organize images by events (similar to concert bands)
    console.log('🏗️  Processing images by events...');
    const eventMap = new Map();
    const categoryStats = {};
    
    for (const image of images) {
      const key = image.relativePath;
      const existing = individualManifest[key] || individualManifest[image.filename] || {};
      
      // Extract event name from filename
      const eventName = extractEventFromFilename(image.filename);
      const category = existing.published ? 'Published' : image.category;
      
      // Create processed image entry
      const processedImage = {
        filename: image.filename,
        path: image.relativePath,
        category: category,
        date: existing.date || extractDateFromFilename(image.filename) || new Date().toISOString(),
        caption: existing.caption || `${eventName} - ${category} photography`,
        description: existing.description || '',
        published: existing.published || false,
        outlet: existing.outlet || null,
        outletUrl: existing.outletUrl || null,
        articleUrl: existing.articleUrl || null,
        articleTitle: existing.articleTitle || null,
        publishedDate: existing.publishedDate || null,
        folderName: image.folderName,
        eventName: eventName
      };
      
      // Group by event name
      if (!eventMap.has(eventName)) {
        eventMap.set(eventName, {
          eventName: eventName,
          category: category,
          folderPath: image.folderName || category,
          dateDisplay: new Date(processedImage.date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          eventDate: {
            iso: processedImage.date.split('T')[0],
            source: 'filename_extraction'
          },
          totalImages: 0,
          images: [],
          published: processedImage.published
        });
      }
      
      const event = eventMap.get(eventName);
      event.images.push(processedImage);
      event.totalImages = event.images.length;
      
      // If any image in event is published, mark event as published
      if (processedImage.published) {
        event.published = true;
        event.category = 'Published';
      }
      
      // Update category stats
      categoryStats[category] = (categoryStats[category] || 0) + 1;
      
      console.log(`   ✓ ${eventName} (${category}): ${image.filename}`);
    }
    
    // Convert to array and sort by date (newest first)
    const events = Array.from(eventMap.values())
      .sort((a, b) => new Date(b.eventDate.iso) - new Date(a.eventDate.iso));
    
    // Create master manifest structure (similar to concert-manifest.json)
    const masterManifest = {
      version: '1.0',
      generated: new Date().toISOString(),
      totalEvents: events.length,
      totalImages: events.reduce((sum, event) => sum + event.totalImages, 0),
      categories: CATEGORIES,
      categoryStats,
      events: events
    };
    
    // Write master manifest
    const manifestJson = JSON.stringify(masterManifest, null, 2);
    await fs.writeFile(MASTER_MANIFEST, manifestJson, 'utf-8');
    
    console.log(`\n✅ Master manifest generated successfully!`);
    console.log(`📄 File: ${MASTER_MANIFEST}`);
    console.log(`📊 Total events: ${masterManifest.totalEvents}`);
    console.log(`📊 Total images: ${masterManifest.totalImages}`);
    
    // Show event breakdown
    events.forEach(event => {
      console.log(`   📅 ${event.eventName}: ${event.totalImages} images (${event.category})`);
    });
    
    // Show category breakdown
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`   📂 ${category}: ${count} images`);
    });
    
    // Show published work summary
    const publishedEvents = events.filter(event => event.published).length;
    if (publishedEvents > 0) {
      console.log(`📰 Published events: ${publishedEvents}`);
    }
    
    console.log(`\n💡 Widget will now load efficiently from single master manifest!`);
    
  } catch (error) {
    console.error('❌ Error generating master manifest:', error.message);
    process.exit(1);
  }
}

/**
 * Recursively discover all journalism images
 */
async function discoverImages(dir, baseDir = dir, images = []) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        // Recursively scan subdirectories
        await discoverImages(fullPath, baseDir, images);
      } else if (entry.isFile() && isImageFile(entry.name)) {
        const relativePath = path.relative(baseDir, fullPath);
        const folderName = path.dirname(relativePath) === '.' ? '' : path.dirname(relativePath);
        
        images.push({
          filename: entry.name,
          fullPath: fullPath,
          relativePath: relativePath,
          folderName: folderName,
          category: categorizeFromPath(relativePath)
        });
      }
    }
    
    return images.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dir}: ${error.message}`);
    return images;
  }
}

/**
 * Check if file is a supported image
 */
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * Auto-categorize based on file path
 */
function categorizeFromPath(relativePath) {
  const pathLower = relativePath.toLowerCase();
  const filename = path.basename(relativePath).toLowerCase();
  
  // Check folder names first
  if (pathLower.includes('politics') || pathLower.includes('political')) {
    return 'Politics';
  }
  if (pathLower.includes('portraits') || pathLower.includes('portrait')) {
    return 'Portraits';
  }
  if (pathLower.includes('events') || pathLower.includes('event')) {
    return 'Events';
  }
  if (pathLower.includes('featured') || pathLower.includes('stories')) {
    return 'Featured';
  }
  
  // Check filename content
  if (filename.includes('protest') || filename.includes('democracy') || 
      filename.includes('trump') || filename.includes('biden') || 
      filename.includes('election') || filename.includes('rally')) {
    return 'Politics';
  }
  
  if (filename.includes('portrait') || filename.includes('headshot')) {
    return 'Portraits';
  }
  
  if (filename.includes('rooney') || filename.includes('conference') || 
      filename.includes('meeting') || filename.includes('event')) {
    return 'Events';
  }
  
  // Default to Events
  return 'Events';
}

/**
 * Extract date from filename patterns
 */
function extractDateFromFilename(filename) {
  // Try various date patterns common in photography
  const patterns = [
    /([0-9]{2})([0-9]{2})([0-9]{2})/,  // YYMMDD
    /([0-9]{4})([0-9]{2})([0-9]{2})/,  // YYYYMMDD
    /([0-9]{2})-([0-9]{2})-([0-9]{2})/, // YY-MM-DD
    /([0-9]{4})-([0-9]{2})-([0-9]{2})/ // YYYY-MM-DD
  ];
  
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      let year = parseInt(match[1]);
      let month = parseInt(match[2]);
      let day = parseInt(match[3]);
      
      // Handle 2-digit years
      if (year < 100) {
        year = year + 2000;
      }
      
      // Validate date ranges
      if (year >= 2020 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(year, month - 1, day).toISOString();
      }
    }
  }
  
  return null;
}

/**
 * Extract event name from filename by removing date prefixes and camera suffixes
 */
function extractEventFromFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove file extension
    .replace(/^\d{6}_?/, '') // Remove YYMMDD date prefix
    .replace(/^\d{8}_?/, '') // Remove YYYYMMDD date prefix
    .replace(/_CAL\d+.*$/, '') // Remove camera suffix like _CAL3148
    .replace(/-min$/, '') // Remove -min suffix
    .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Create a manifest entry for an image
 */
async function createManifestEntry(image, isTemplate = false) {
  const title = titleFromFilename(image.filename);
  
  // Try to get file modification date as fallback
  let dateISO = null;
  try {
    const stats = await fs.stat(image.fullPath);
    dateISO = stats.mtime.toISOString();
  } catch (error) {
    // Use current date as fallback
    dateISO = new Date().toISOString();
  }
  
  // Create base entry
  const entry = {
    date: dateISO,
    caption: isTemplate ? `TODO: Add caption for ${title}` : `${title} - Photojournalism coverage`,
    description: isTemplate ? `TODO: Add description for ${title}` : `Professional journalism photograph from ${image.category.toLowerCase()} coverage`,
    published: false,
    outlet: null,
    outletUrl: null,
    articleUrl: null,
    articleTitle: null,
    publishedDate: null
  };
  
  // Add template comments for published work
  if (isTemplate) {
    entry._template_instructions = {
      published: "Set to true if this work has been published",
      outlet: "Name of the publication/outlet (e.g., 'New York Post', 'Pittsburgh Union Progress', 'Technically', 'Next Generation Newsroom', 'The Globe')",
      outletUrl: "Homepage URL of the outlet",
      articleUrl: "Direct link to the published article/story",
      articleTitle: "Headline/title of the published article",
      publishedDate: "Date when article was published (YYYY-MM-DD format)"
    };
  }
  
  return entry;
}

/**
 * Generate title from filename
 */
function titleFromFilename(filename) {
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/^\d+[-_]/, '') // Remove date prefix
    .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Check if file exists
 */
async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  discoverImages,
  createManifestEntry,
  categorizeFromPath,
  titleFromFilename,
  extractDateFromFilename,
  extractEventFromFilename
};
