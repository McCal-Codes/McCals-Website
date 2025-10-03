#!/usr/bin/env node

/**
 * Featured Portfolio Manifest Generator
 * 
 * Creates a curated "featured" manifest by selecting the most recent items
 * from each portfolio category for the featured portfolio widget.
 * 
 * Features:
 * - Selects newest items from each category (Concert, Events, Journalism)
 * - Configurable number of featured items per category
 * - Uses existing portfolio-manifest.json as source
 * - Perfect for the Featured Portfolio widget
 * 
 * Usage:
 *   node scripts/generate-featured-manifest.js
 *   node scripts/generate-featured-manifest.js --limit 6
 */

const fs = require('fs').promises;
const path = require('path');

const PORTFOLIOS_BASE = path.join(process.cwd(), 'src', 'images', 'Portfolios');
const SOURCE_MANIFEST = path.join(PORTFOLIOS_BASE, 'portfolio-manifest.json');
const OUTPUT_MANIFEST = path.join(PORTFOLIOS_BASE, 'featured-manifest.json');

// Configuration
const DEFAULT_ITEMS_PER_CATEGORY = 4;
const TOTAL_FEATURED_LIMIT = 12;

async function log(message, ...args) {
  console.log(`⭐ ${message}`, ...args);
}

async function error(message, ...args) {
  console.error(`❌ ${message}`, ...args);
}

async function success(message, ...args) {
  console.log(`✅ ${message}`, ...args);
}

async function readSourceManifest() {
  try {
    const content = await fs.readFile(SOURCE_MANIFEST, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to read source manifest: ${err.message}`);
  }
}

function parseDate(item) {
  // Extract date from various possible formats
  let dateValue = 0;
  
  if (item.date && item.date.iso) {
    dateValue = new Date(item.date.iso).getTime();
  } else if (item.dateISO) {
    dateValue = new Date(item.dateISO).getTime();
  } else if (item.generatedAt) {
    dateValue = new Date(item.generatedAt).getTime();
  } else if (item.lastUpdated) {
    dateValue = new Date(item.lastUpdated).getTime();
  }
  
  return isNaN(dateValue) ? 0 : dateValue;
}

function selectFeaturedItems(items, itemsPerCategory = DEFAULT_ITEMS_PER_CATEGORY) {
  // Group items by category/type
  const categories = {};
  
  items.forEach(item => {
    const category = item.type || item.category || 'Other';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push({
      ...item,
      dateValue: parseDate(item)
    });
  });
  
  // Sort each category by date (newest first) and select top items
  const featured = [];
  
  Object.entries(categories).forEach(([category, categoryItems]) => {
    categoryItems.sort((a, b) => b.dateValue - a.dateValue);
    const selected = categoryItems.slice(0, itemsPerCategory);
    featured.push(...selected);
    log(`Selected ${selected.length} items from ${category}`);
  });
  
  // Sort all featured items by date and limit total
  featured.sort((a, b) => b.dateValue - a.dateValue);
  return featured.slice(0, TOTAL_FEATURED_LIMIT);
}

function cleanFeaturedItem(item) {
  // Clean up the item for featured display
  const cleaned = { ...item };
  
  // Remove internal dateValue used for sorting
  delete cleaned.dateValue;
  
  // Ensure we have required fields for the widget
  if (!cleaned.id) {
    cleaned.id = cleaned.name || cleaned.title || `item-${Date.now()}`;
  }
  
  if (!cleaned.title) {
    cleaned.title = cleaned.name || cleaned.id;
  }
  
  // Ensure we have a cover image (first image if not set)
  if (!cleaned.coverImage && cleaned.images && cleaned.images.length > 0) {
    cleaned.coverImage = cleaned.images[0];
  }
  
  return cleaned;
}

async function generateFeaturedManifest() {
  try {
    log('Starting featured manifest generation...');
    
    // Read source manifest
    const sourceManifest = await readSourceManifest();
    log(`Loaded source manifest with ${sourceManifest.totalItems} items`);
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const limitArg = args.find(arg => arg.startsWith('--limit'));
    const itemsPerCategory = limitArg 
      ? parseInt(limitArg.split('=')[1] || args[args.indexOf(limitArg) + 1]) || DEFAULT_ITEMS_PER_CATEGORY
      : DEFAULT_ITEMS_PER_CATEGORY;
    
    log(`Using ${itemsPerCategory} items per category, max ${TOTAL_FEATURED_LIMIT} total`);
    
    // Select featured items
    const featuredItems = selectFeaturedItems(sourceManifest.items || [], itemsPerCategory);
    const cleanedItems = featuredItems.map(cleanFeaturedItem);
    
    // Build featured manifest
    const featuredManifest = {
      version: '1.0',
      type: 'featured',
      generated: new Date().toISOString(),
      source: 'portfolio-manifest.json',
      totalItems: cleanedItems.length,
      totalImages: cleanedItems.reduce((sum, item) => sum + (item.totalImages || item.images?.length || 0), 0),
      categories: [...new Set(cleanedItems.map(item => item.category || item.type))],
      description: 'Curated selection of newest portfolio highlights across all categories',
      items: cleanedItems
    };
    
    // Write featured manifest
    const content = JSON.stringify(featuredManifest, null, 2) + '\n';
    await fs.writeFile(OUTPUT_MANIFEST, content, 'utf-8');
    
    success(`Generated featured manifest: ${OUTPUT_MANIFEST}`);
    success(`Selected ${cleanedItems.length} featured items with ${featuredManifest.totalImages} images`);
    
    // Show category breakdown
    const categoryBreakdown = {};
    cleanedItems.forEach(item => {
      const cat = item.category || item.type || 'Other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });
    
    log('\n📋 Featured Items by Category:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`   • ${category}: ${count} items`);
    });
    
  } catch (err) {
    error('Failed to generate featured manifest:', err.message);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
⭐ Featured Portfolio Manifest Generator

Creates a curated "featured" manifest by selecting the most recent items
from each portfolio category for display in the Featured Portfolio widget.

Usage:
  node scripts/generate-featured-manifest.js
  node scripts/generate-featured-manifest.js --limit 6

Options:
  --limit N    Items per category to include (default: ${DEFAULT_ITEMS_PER_CATEGORY})
  --help       Show this help message

Output:
  Creates: src/images/Portfolios/featured-manifest.json

Features:
  • Selects newest items from each portfolio category
  • Maintains category diversity in featured selection
  • Optimized for Featured Portfolio widget performance
  • Updates automatically when source manifest changes

Examples:
  node scripts/generate-featured-manifest.js
  node scripts/generate-featured-manifest.js --limit 3
`);
  process.exit(0);
}

// Generate the featured manifest
generateFeaturedManifest().catch(err => {
  error('Failed to run generator:', err.message);
  process.exit(1);
});