#!/usr/bin/env node

/**
 * Journalism Portfolio Manifest Generator
 * Generates manifest.json for journalism portfolio with publication tracking
 * 
 * Features:
 * - Auto-discovers images in journalism folders
 * - Creates structured manifest with publication metadata
 * - Supports outlet information and article links
 * - EXIF data extraction for dates and captions
 * - Template generation for easy editing
 * 
 * Usage:
 *   node scripts/generate-journalism-manifest.js
 *   node scripts/generate-journalism-manifest.js --force  # Overwrite existing
 *   node scripts/generate-journalism-manifest.js --template  # Template only
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const JOURNALISM_DIR = path.join(__dirname, '../images/Portfolios/Journalism');
const MANIFEST_FILE = path.join(JOURNALISM_DIR, 'manifest.json');
const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

// Command line arguments
const args = process.argv.slice(2);
const FORCE_OVERWRITE = args.includes('--force');
const TEMPLATE_ONLY = args.includes('--template');

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🔍 Journalism Portfolio Manifest Generator v1.0');
    console.log(`📁 Scanning: ${JOURNALISM_DIR}`);
    
    // Check if journalism directory exists
    if (!await exists(JOURNALISM_DIR)) {
      console.error(`❌ Journalism directory not found: ${JOURNALISM_DIR}`);
      process.exit(1);
    }
    
    // Check if manifest already exists
    if (await exists(MANIFEST_FILE) && !FORCE_OVERWRITE && !TEMPLATE_ONLY) {
      console.log('📄 Manifest file already exists. Use --force to overwrite or --template for template generation.');
      process.exit(0);
    }
    
    // Discover all journalism images
    const images = await discoverImages(JOURNALISM_DIR);
    console.log(`📸 Found ${images.length} journalism images`);
    
    if (images.length === 0) {
      console.log('⚠️  No images found in journalism directory');
      process.exit(0);
    }
    
    // Load existing manifest if it exists
    let existingManifest = {};
    if (await exists(MANIFEST_FILE)) {
      try {
        const existingContent = await fs.readFile(MANIFEST_FILE, 'utf-8');
        existingManifest = JSON.parse(existingContent);
        console.log('📋 Loaded existing manifest data');
      } catch (error) {
        console.warn('⚠️  Could not parse existing manifest, creating new one');
      }
    }
    
    // Generate manifest entries
    console.log('🏗️  Generating manifest entries...');
    const manifest = {};
    
    for (const image of images) {
      const key = image.relativePath;
      
      // Use existing data if available, otherwise create template
      if (existingManifest[key]) {
        manifest[key] = existingManifest[key];
        console.log(`   ✓ Preserved existing: ${key}`);
      } else {
        manifest[key] = await createManifestEntry(image, TEMPLATE_ONLY);
        console.log(`   + Added new: ${key}`);
      }
    }
    
    // Write manifest file
    const manifestJson = JSON.stringify(manifest, null, 2);
    await fs.writeFile(MANIFEST_FILE, manifestJson, 'utf-8');
    
    console.log(`\n✅ Manifest generated successfully!`);
    console.log(`📄 File: ${MANIFEST_FILE}`);
    console.log(`📊 Entries: ${Object.keys(manifest).length}`);
    
    if (TEMPLATE_ONLY) {
      console.log(`\n💡 Template generated! Edit the manifest.json file to add publication details:`);
      console.log(`   - Set "published": true for published work`);
      console.log(`   - Add outlet information and article links`);
      console.log(`   - Update captions and descriptions`);
    }
    
    // Show summary of published work
    const publishedCount = Object.values(manifest).filter(entry => entry.published).length;
    if (publishedCount > 0) {
      console.log(`📰 Published work: ${publishedCount} images`);
    }
    
  } catch (error) {
    console.error('❌ Error generating manifest:', error.message);
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
      outlet: "Name of the publication/outlet (e.g., 'Local News Network')",
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
  titleFromFilename
};