#!/usr/bin/env node

/**
 * Enhanced Featured Portfolio Manifest Generator
 *
 * Creates a curated "featured" manifest by aggregating images from all portfolio widgets
 * and selecting the most recent items using the new shared date parsing system.
 *
 * Features:
 * - Aggregates images from all portfolio widgets (Concert, Events, Journalism)
 * - Uses ../utils/shared-date-parsing.js for consistent date handling across all manifests
 * - Selects newest items from each category with proper date validation
 * - Configurable number of featured items per category
 * - Maintains widget compatibility with existing manifest structure
 * - Perfect for the Featured Portfolio widget v1.4+
 *
 * Usage:
 *   node scripts/generate-featured-manifest.js
 *   node scripts/generate-featured-manifest.js --limit 6
 *   node scripts/generate-featured-manifest.js --total 15
 */

const fs = require('fs').promises;
const path = require('path');
const { detectDateFromImages, formatDisplayDate, createFallbackDate } = require('../utils/shared-date-parsing.js');
const { notify } = require('../utils/manifest-webhook');
const { dedupeImageEntries, imageEntryName } = require('../utils/image-manifest-dedupe.js');

const PORTFOLIOS_BASE = path.join(process.cwd(), 'src', 'images', 'Portfolios');
const OUTPUT_MANIFEST = path.join(PORTFOLIOS_BASE, 'featured-manifest.json');
const CURATION_CONFIG = path.join(__dirname, 'featured-curation.json');

// Portfolio widget manifest paths
const PORTFOLIO_MANIFESTS = {
  Concert: path.join(PORTFOLIOS_BASE, 'Concert', 'concert-manifest.json'),
  Events: path.join(PORTFOLIOS_BASE, 'Events', 'events-manifest.json'),
  Journalism: path.join(PORTFOLIOS_BASE, 'Journalism', 'journalism-manifest.json')
};

// Configuration
const DEFAULT_ITEMS_PER_CATEGORY = 4;
const TOTAL_FEATURED_LIMIT = 12;

async function log(message, ...args) {
  console.log(`⭐ ${message} - generate-featured-manifest.js:42`, ...args);
}

async function error(message, ...args) {
  console.error(`❌ ${message} - generate-featured-manifest.js:46`, ...args);
}

async function success(message, ...args) {
  console.log(`✅ ${message} - generate-featured-manifest.js:50`, ...args);
}

async function readPortfolioManifest(manifestPath, category) {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    const manifest = JSON.parse(content);

    // Normalize different manifest structures
    let items = [];
    let itemCount = 0;

    if (category === 'Concert' && manifest.bands) {
      // Concert manifest uses "bands" array
      items = manifest.bands.map(band => ({
        ...band,
        name: band.bandName,
        title: band.bandName,
        date: band.concertDate,
        type: 'Concert',
        category: 'Concert Photography'
      }));
      itemCount = items.length;
    } else if (manifest.items) {
      // Standard manifest structure
      items = manifest.items;
      itemCount = items.length;
    } else if (manifest.events) {
      // Events and Journalism manifests use "events" array
      if (category === 'Events') {
        items = manifest.events.map(event => ({
          ...event,
          name: event.eventName,
          title: event.eventName,
          date: event.eventDate,
          type: 'Events',
          category: 'Event Photography'
        }));
      } else if (category === 'Journalism') {
        items = manifest.events.map(event => ({
          ...event,
          name: event.eventName,
          title: event.eventName,
          date: event.eventDate,
          type: 'Journalism',
          category: 'Journalism'
        }));
      }
      itemCount = items.length;
    } else if (manifest.articles) {
      // Journalism manifest might use "articles" array
      items = manifest.articles.map(article => ({
        ...article,
        name: article.title || article.eventName,
        title: article.title || article.eventName,
        type: 'Journalism',
        category: 'Journalism'
      }));
      itemCount = items.length;
    }

    log(`Loaded ${category} manifest: ${itemCount} items`);
    return { manifest: { ...manifest, items }, category };
  } catch (err) {
    if (err.code === 'ENOENT') {
      log(`⚠️  ${category} manifest not found: ${manifestPath}`);
      return { manifest: { items: [] }, category };
    }
    throw new Error(`Failed to read ${category} manifest: ${err.message}`);
  }
}

async function readAllPortfolioManifests() {
  const manifestPromises = Object.entries(PORTFOLIO_MANIFESTS).map(([category, path]) =>
    readPortfolioManifest(path, category)
  );

  const results = await Promise.all(manifestPromises);
  return results;
}

async function readFeaturedCuration() {
  try {
    const content = await fs.readFile(CURATION_CONFIG, 'utf-8');
    const config = JSON.parse(content);
    const items = Array.isArray(config.items) ? config.items : [];
    log(`Loaded featured curation: ${items.length} override(s)`);
    return items;
  } catch (err) {
    if (err.code === 'ENOENT') {
      log('No featured curation config found; using automatic selection only');
      return [];
    }
    throw new Error(`Failed to read featured curation config: ${err.message}`);
  }
}

function parseDate(item) {
  // Use the new shared date parsing system for consistency
  let dateValue = 0;
  let parsedDate = null;

  // Try to extract date from existing date field (highest priority)
  if (item.date && item.date.iso) {
    const isoDate = new Date(item.date.iso);
    if (!isNaN(isoDate.getTime())) {
      dateValue = isoDate.getTime();
      parsedDate = item.date;
    }
  }

  // If no valid date found, try parsing from image filenames using shared date parsing
  if (dateValue === 0 && item.images && Array.isArray(item.images)) {
    const detectedDate = detectDateFromImages(item.images);
    if (detectedDate) {
      dateValue = new Date(detectedDate.iso).getTime();
      parsedDate = detectedDate;
      log(`  📅 Detected date from images for "${item.name || item.title}": ${detectedDate.iso} (${detectedDate.source})`);
    }
  }

  // Fallback to other date fields
  if (dateValue === 0) {
    const fallbackDates = [item.dateISO, item.generatedAt, item.lastUpdated];
    for (const dateStr of fallbackDates) {
      if (dateStr) {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          dateValue = parsed.getTime();
          break;
        }
      }
    }
  }

  // Final fallback to current year if no date found
  if (dateValue === 0) {
    const fallback = createFallbackDate();
    dateValue = new Date(fallback.iso).getTime();
    parsedDate = fallback;
    log(`  ⚠️  No date found for "${item.name || item.title}", using fallback: ${fallback.iso}`);
  }

  return { dateValue, parsedDate };
}

function normalizePortfolioItem(item, category) {
  const { dateValue, parsedDate } = parseDate(item);

  // For Journalism items, preserve full image objects with captions
  let images = item.images || [];
  if (category === 'Journalism' && images.length > 0 && typeof images[0] === 'object') {
    // Journalism manifest already has objects with captions - keep them
    images = images.map(img => ({
      filename: img.filename || img.path,
      caption: img.caption,
      description: img.description,
      path: img.path
    }));
  }
  images = dedupeImageEntries(images);
  const requestedCover = item.coverImage || item.cover || (item.images && item.images[0]) || null;
  const coverName = imageEntryName(requestedCover);
  const coverImage = images.find(img => imageEntryName(img) === coverName) || images[0] || requestedCover;

  return {
    ...item,
    type: category,
    category: `${category} Photography`,
    dateValue,
    date: parsedDate || item.date,
    dateDisplay: parsedDate ? formatDisplayDate(parsedDate) : (item.dateDisplay || ''),
    // Ensure required fields for the featured widget
    id: item.id || item.name || item.title || `${category.toLowerCase()}-${Date.now()}`,
    title: item.title || item.name || item.id || 'Untitled',
    folderPath: item.folderPath || item.path || '',
    coverImage,
    totalImages: images.length,
    images: images
  };
}

function normalizeLookupValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function itemLookupKeys(item) {
  const type = normalizeLookupValue(item.type);
  const candidates = [item.id, item.title, item.name, item.bandName, item.eventName]
    .map(normalizeLookupValue)
    .filter(Boolean);

  return candidates.map(candidate => `${type}:${candidate}`);
}

function curationLookupKey(entry) {
  return `${normalizeLookupValue(entry.type)}:${normalizeLookupValue(entry.title || entry.id || entry.name)}`;
}

function createCurationLookup(curationItems) {
  const lookup = new Map();

  curationItems.forEach((entry, index) => {
    const key = curationLookupKey(entry);
    if (!key.endsWith(':')) {
      const entries = lookup.get(key) || [];
      entries.push({
        ...entry,
        rank: Number.isFinite(Number(entry.rank)) ? Number(entry.rank) : index + 1
      });
      lookup.set(key, entries);
    }
  });

  return lookup;
}

function sourceMatchesCuration(item, entry) {
  if (!entry.sourcePath) return true;

  const itemSources = [
    item.sourcePath,
    item.relativeFolderPath,
    item.folderPath,
  ].map(normalizeLookupValue);

  return itemSources.includes(normalizeLookupValue(entry.sourcePath));
}

function findCurationEntry(item, lookup) {
  for (const key of itemLookupKeys(item)) {
    if (lookup.has(key)) {
      const entries = lookup.get(key);
      const matchedEntry = entries.find(entry => sourceMatchesCuration(item, entry));

      if (matchedEntry) {
        return matchedEntry;
      }
    }
  }

  return null;
}

function findCoverOverride(item, coverImage) {
  if (!coverImage) return item.coverImage;

  return (item.images || []).find(image => {
    const name = imageEntryName(image);
    const pathValue = typeof image === 'object' ? image.path : image;
    return name === coverImage || pathValue === coverImage;
  }) || coverImage;
}

function applyCuration(item, curationEntry) {
  if (!curationEntry) return item;

  const coverImage = findCoverOverride(item, curationEntry.coverImage);

  return {
    ...item,
    featuredRank: curationEntry.rank,
    featuredDescription: curationEntry.description,
    featuredCover: curationEntry.coverImage,
    sourcePath: item.relativeFolderPath || item.folderPath || '',
    coverImage
  };
}

function uniqueFeaturedKey(item) {
  const source = normalizeLookupValue(item.sourcePath || item.relativeFolderPath || item.folderPath);
  const identifier = source || normalizeLookupValue(item.id || item.title || item.name);

  return `${normalizeLookupValue(item.type)}:${identifier}`;
}

function appendUniqueFeaturedItem(featured, selectedKeys, item) {
  const key = uniqueFeaturedKey(item);

  if (selectedKeys.has(key)) {
    return false;
  }

  selectedKeys.add(key);
  featured.push(item);
  return true;
}

function compareFeaturedSelection(a, b) {
  const dateDelta = b.dateValue - a.dateValue;

  if (dateDelta !== 0) {
    return dateDelta;
  }

  const aRank = a.featuredRank || Number.POSITIVE_INFINITY;
  const bRank = b.featuredRank || Number.POSITIVE_INFINITY;

  if (aRank !== bRank) {
    return aRank - bRank;
  }

  return String(a.title || a.name || '').localeCompare(String(b.title || b.name || ''));
}

function selectFeaturedItems(
  allManifests,
  curationItems = [],
  itemsPerCategory = DEFAULT_ITEMS_PER_CATEGORY,
  totalLimit = TOTAL_FEATURED_LIMIT,
) {
  const categories = {};
  const curationLookup = createCurationLookup(curationItems);
  const curatedItems = [];
  let totalSourceItems = 0;

  // Process each portfolio manifest
  allManifests.forEach(({ manifest, category }) => {
    const items = manifest.items || [];
    totalSourceItems += items.length;

    if (!categories[category]) {
      categories[category] = [];
    }

    // Normalize and add items from this portfolio
    items.forEach(item => {
      const normalized = normalizePortfolioItem(item, category);
      const curated = applyCuration(normalized, findCurationEntry(normalized, curationLookup));
      categories[category].push(curated);
      if (curated.featuredRank) {
        curatedItems.push(curated);
      }
    });

    log(`Processed ${items.length} items from ${category} portfolio`);
  });

  log(`📊 Total source items across all portfolios: ${totalSourceItems}`);
  log(`🎛️  Matched ${curatedItems.length} curated featured item(s)`);

  const featured = [];
  const selectedKeys = new Set();
  const sortedCategories = Object.entries(categories).map(([category, categoryItems]) => {
    categoryItems.sort((a, b) => b.dateValue - a.dateValue);
    return [category, categoryItems];
  });

  // First guarantee the newest work from every portfolio type. This keeps the
  // featured page dynamic when new journalism, event, or concert work lands.
  for (let index = 0; index < itemsPerCategory; index += 1) {
    sortedCategories.forEach(([, categoryItems]) => {
      const item = categoryItems[index];

      if (item && featured.length < totalLimit) {
        appendUniqueFeaturedItem(featured, selectedKeys, item);
      }
    });
  }

  // Then use the curated list to fill any remaining slots with hand-picked work
  // and to carry cover/description overrides for items already selected above.
  curatedItems
    .sort((a, b) => a.featuredRank - b.featuredRank)
    .forEach(item => {
      if (featured.length < totalLimit) {
        appendUniqueFeaturedItem(featured, selectedKeys, item);
      }
    });

  if (featured.length < totalLimit) {
    sortedCategories
      .flatMap(([, categoryItems]) => categoryItems)
      .sort((a, b) => b.dateValue - a.dateValue)
      .forEach(item => {
        if (featured.length < totalLimit) {
          appendUniqueFeaturedItem(featured, selectedKeys, item);
        }
      });
  }

  sortedCategories.forEach(([category]) => {
    const selected = featured.filter(item => item.type === category);

    if (selected.length > 0) {
      const sorted = selected.sort((a, b) => b.dateValue - a.dateValue);
      const newestDate = new Date(sorted[0].dateValue).toLocaleDateString();
      const oldestDate = new Date(sorted[sorted.length - 1].dateValue).toLocaleDateString();
      log(`✨ Selected ${selected.length} dynamic item(s) from ${category} (${newestDate} to ${oldestDate})`);
    }
  });

  return featured.sort(compareFeaturedSelection);
}

function cleanFeaturedItem(item) {
  // Clean up the item for featured display
  const cleaned = { ...item };

  // Remove internal dateValue used for sorting
  delete cleaned.dateValue;
  delete cleaned.parsedDate;

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

  // Add some tags based on category for better widget display
  if (!cleaned.tags) {
    cleaned.tags = [];
  }

  // Add category-specific tags if not present
  const categoryTags = {
    Concert: ['Live Music', 'Concert', 'Performance'],
    Events: ['Event', 'Corporate', 'Professional'],
    Journalism: ['Documentary', 'Journalism', 'Story']
  };

  const relevantTags = categoryTags[cleaned.type] || [];
  const existingTags = new Set(cleaned.tags.map(t => t.toLowerCase()));

  relevantTags.forEach(tag => {
    if (!existingTags.has(tag.toLowerCase())) {
      cleaned.tags.push(tag);
    }
  });

  return cleaned;
}

async function generateFeaturedManifest() {
  try {
    log('🚀 Starting enhanced featured manifest generation...');
    log('   Using shared date parsing system for consistency across all widgets');

    // Read all portfolio manifests
    const allManifests = await readAllPortfolioManifests();
    const curationItems = await readFeaturedCuration();
    const activeManifests = allManifests.filter(({ manifest }) => manifest.items && manifest.items.length > 0);

    if (activeManifests.length === 0) {
      throw new Error('No portfolio manifests found with items. Ensure Concert, Events, or Journalism manifests exist.');
    }

    log(`📂 Found ${activeManifests.length} active portfolio manifest(s): ${activeManifests.map(m => m.category).join(', ')}`);

    // Parse command line arguments
    const args = process.argv.slice(2);
    const limitArg = args.find(arg => arg.startsWith('--limit'));
    const totalArg = args.find(arg => arg.startsWith('--total'));

    const itemsPerCategory = limitArg
      ? parseInt(limitArg.split('=')[1] || args[args.indexOf(limitArg) + 1]) || DEFAULT_ITEMS_PER_CATEGORY
      : DEFAULT_ITEMS_PER_CATEGORY;

    const totalLimit = totalArg
      ? parseInt(totalArg.split('=')[1] || args[args.indexOf(totalArg) + 1]) || TOTAL_FEATURED_LIMIT
      : TOTAL_FEATURED_LIMIT;

    log(`⚙️  Configuration: ${itemsPerCategory} items per category, max ${totalLimit} total`);

    // Select featured items using the enhanced algorithm
    const featuredItems = selectFeaturedItems(activeManifests, curationItems, itemsPerCategory, totalLimit);
    const cleanedItems = featuredItems.slice(0, totalLimit).map(cleanFeaturedItem);

    if (cleanedItems.length === 0) {
      throw new Error('No valid items found to feature. Check that portfolio manifests contain properly formatted items.');
    }

    // Build enhanced featured manifest
    const featuredManifest = {
      version: '2.0.0',
      type: 'featured',
      generated: new Date().toISOString(),
      generatedBy: 'enhanced-featured-manifest-generator',
      sources: activeManifests.map(({ category }) => `${category.toLowerCase()}-manifest.json`),
      totalItems: cleanedItems.length,
      totalImages: cleanedItems.reduce((sum, item) => sum + (item.totalImages || item.images?.length || 0), 0),
      categories: [...new Set(cleanedItems.map(item => item.category || item.type))].sort(),
      portfolioTypes: [...new Set(cleanedItems.map(item => item.type))].sort(),
      dateRange: {
        newest: cleanedItems.length > 0 ? new Date(Math.max(...cleanedItems.map(item => new Date(item.date?.iso || item.dateISO || 0).getTime()))).toISOString().split('T')[0] : null,
        oldest: cleanedItems.length > 0 ? new Date(Math.min(...cleanedItems.map(item => new Date(item.date?.iso || item.dateISO || 0).getTime()))).toISOString().split('T')[0] : null
      },
      description: 'Enhanced curated selection aggregating newest portfolio highlights from all widgets using shared date parsing',
      config: {
        itemsPerCategory,
        totalLimit,
        usesSharedDateParsing: true,
        curationConfig: path.relative(process.cwd(), CURATION_CONFIG),
        curatedItems: cleanedItems.filter(item => item.featuredRank).length
      },
      items: cleanedItems
    };

    // Write featured manifest
    const content = JSON.stringify(featuredManifest, null, 2) + '\n';
    await fs.writeFile(OUTPUT_MANIFEST, content, 'utf-8');
    try {
      await notify('featured', { path: OUTPUT_MANIFEST, written: true });
    } catch (err) {
      console.warn('Failed to notify manifest webhook (featured):', err && err.message);
    }

    success(`✨ Generated enhanced featured manifest: ${OUTPUT_MANIFEST}`);
    success(`   Selected ${cleanedItems.length} featured items with ${featuredManifest.totalImages} total images`);
    success(`   Date range: ${featuredManifest.dateRange.oldest} to ${featuredManifest.dateRange.newest}`);

    // Show detailed breakdown
    const categoryBreakdown = {};
    const sourceBreakdown = {};

    cleanedItems.forEach(item => {
      const cat = item.category || item.type || 'Other';
      const type = item.type || 'Other';
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
      sourceBreakdown[type] = (sourceBreakdown[type] || 0) + 1;
    });

    log('\n� Featured Items Breakdown:');
    log('   By Category:');
    Object.entries(categoryBreakdown).forEach(([category, count]) => {
      console.log(`• ${category}: ${count} items - generate-featured-manifest.js:374`);
    });

    log('   By Source Portfolio:');
    Object.entries(sourceBreakdown).forEach(([type, count]) => {
      console.log(`• ${type}: ${count} items - generate-featured-manifest.js:379`);
    });

    log(`\n🎯 Featured manifest ready for use with Featured Portfolio widget v1.4+`);

  } catch (err) {
    error('❌ Failed to generate featured manifest:', err.message);
    if (err.stack) {
      console.error('Stack trace: - generate-featured-manifest.js:387', err.stack);
    }
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
⭐ Enhanced Featured Portfolio Manifest Generator

Creates a curated "featured" manifest by aggregating images from ALL portfolio widgets
and selecting the most recent items using the new shared date parsing system.

Usage:
  node scripts/generate-featured-manifest.js
  node scripts/generate-featured-manifest.js --limit 6
  node scripts/generate-featured-manifest.js --limit 3 --total 15

Options:
  --limit N    Items per category to include (default: ${DEFAULT_ITEMS_PER_CATEGORY})
  --total N    Maximum total items across all categories (default: ${TOTAL_FEATURED_LIMIT})
  --help       Show this help message

Source Manifests:
  • Concert: src/images/Portfolios/Concert/concert-manifest.json
  • Events: src/images/Portfolios/Events/events-manifest.json
  • Journalism: src/images/Portfolios/Journalism/journalism-manifest.json

Output:
  Creates: src/images/Portfolios/featured-manifest.json

Enhanced Features:
  ✨ Aggregates images from ALL portfolio widgets (Concert, Events, Journalism)
  📅 Uses shared-date-parsing.js for consistent date handling across all widgets
  🎯 Selects newest items from each category with proper date validation
  📊 Maintains category diversity in featured selection
  🔄 Automatically detects dates from image filenames when manifest dates missing
  ⚡ Optimized for Featured Portfolio widget v1.4+ performance
  🏷️  Auto-generates category-specific tags for better widget display

Examples:
  node scripts/generate-featured-manifest.js
  node scripts/generate-featured-manifest.js --limit 3
  node scripts/generate-featured-manifest.js --limit 5 --total 20
`);
  process.exit(0);
}

// Generate the featured manifest
generateFeaturedManifest().catch(err => {
  error('Failed to run generator:', err.message);
  process.exit(1);
});
