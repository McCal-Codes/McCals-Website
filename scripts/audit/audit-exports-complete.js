#!/usr/bin/env node
/**
 * Complete Photo Audit for All Exports
 * Analyzes all photos and identifies importable candidates for site portfolios
 */

import { promises as fs } from 'fs';
import { join, dirname, basename, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXPORTS_PATH = 'H:\\My Drive\\03 - Multimedia\\01 - Photo\\01 - Active Projects\\Exports';
const PORTFOLIO_BASE = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios';

// Category mapping from source folders to portfolio types
const CATEGORY_MAP = {
  'Concerts': 'Concert',
  'Events': 'Events',
  'Sports': 'Events',
  'Graduations': 'Events',
  'Journalism': 'Journalism',
  'Portraits': 'Portrait',
  'Boy Scouts': 'Portrait',
  'Boyd Station': 'Events',
  'Liam Sulivan': 'Portrait',
  'Cars and Birbs': 'Nature'
};

async function fullAudit() {
  console.log('🔍 Complete Exports Audit - All Years\n');
  
  const audit = {
    timestamp: new Date().toISOString(),
    totalFiles: 0,
    totalSize: 0,
    byYear: {},
    byCategory: {},
    importable: [],
    needsProcessing: [],
    duplicates: [],
    issues: []
  };

  async function scanDir(dirPath, year = 'unknown', category = 'unknown') {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          // Detect year/category from folder structure
          const folderName = entry.name;
          const detectedYear = /^\d{4}$/.test(folderName) ? folderName : year;
          const detectedCategory = CATEGORY_MAP[folderName] || category;
          
          await scanDir(fullPath, detectedYear, detectedCategory);
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();
          if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;
          
          const stats = await fs.stat(fullPath);
          audit.totalFiles++;
          audit.totalSize += stats.size;
          
          // Track by year
          if (!audit.byYear[year]) audit.byYear[year] = { count: 0, size: 0 };
          audit.byYear[year].count++;
          audit.byYear[year].size += stats.size;
          
          // Track by category
          if (!audit.byCategory[category]) audit.byCategory[category] = { count: 0, size: 0 };
          audit.byCategory[category].count++;
          audit.byCategory[category].size += stats.size;
          
          // Analyze file for import suitability
          const analysis = analyzeFile(entry.name, fullPath, year, category, stats.size);
          
          if (analysis.importable) {
            audit.importable.push(analysis);
          } else {
            audit.needsProcessing.push(analysis);
          }
        }
      }
    } catch (err) {
      audit.issues.push({ path: dirPath, error: err.message });
    }
  }

  function analyzeFile(filename, fullPath, year, category, sizeBytes) {
    // Check for webuse suffix (already processed for web)
    const isWebOptimized = filename.includes('_webuse');
    const isSocialMedia = filename.toLowerCase().includes('social media');
    const isFullRes = filename.toLowerCase().includes('full resolution');
    
    // Extract event name from filename
    const eventMatch = filename.match(/^\d+_(.+?)_CAL\d+/);
    const eventName = eventMatch ? eventMatch[1] : 'Unknown Event';
    
    // Parse date from filename (YYMMDD or YYYYMMDD)
    const dateMatch = filename.match(/^(\d{2})(\d{2})(\d{2})/);
    const date = dateMatch ? {
      year: 2000 + parseInt(dateMatch[1]),
      month: parseInt(dateMatch[2]),
      day: parseInt(dateMatch[3])
    } : null;
    
    // Import criteria:
    // - Has _webuse suffix (already optimized)
    // - In "Social Media Optimized" folder
    // - Size < 20MB (reasonable for web)
    const importable = isWebOptimized || (sizeBytes < 20 * 1024 * 1024 && !isFullRes);
    
    return {
      filename,
      fullPath,
      category,
      eventName: eventName.replace(/&/g, 'and'),
      date,
      year,
      sizeBytes,
      sizeMB: (sizeBytes / 1024 / 1024).toFixed(2),
      isWebOptimized,
      isSocialMedia,
      importable,
      reason: importable ? 'ready' : (isFullRes ? 'full-resolution' : 'needs-optimization')
    };
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatNumber(num) {
    return num.toLocaleString();
  }

  // Run scan
  await scanDir(EXPORTS_PATH);

  // Generate import recommendations
  const byEvent = {};
  audit.importable.forEach(item => {
    const key = `${item.category}/${item.eventName}`;
    if (!byEvent[key]) {
      byEvent[key] = {
        category: item.category,
        eventName: item.eventName,
        year: item.year,
        count: 0,
        totalSize: 0,
        sampleImage: item.filename
      };
    }
    byEvent[key].count++;
    byEvent[key].totalSize += item.sizeBytes;
  });

  // Print Report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('               COMPLETE EXPORTS AUDIT REPORT                ');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`📅 Audit Date: ${new Date().toLocaleString()}`);
  console.log(`📁 Source: ${EXPORTS_PATH}`);
  console.log(`🖼️  Total Images: ${formatNumber(audit.totalFiles)}`);
  console.log(`💾 Total Size: ${formatBytes(audit.totalSize)}\n`);

  console.log('📊 BY YEAR:');
  console.log('─'.repeat(60));
  Object.entries(audit.byYear)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .forEach(([year, data]) => {
      console.log(`  ${year.padEnd(10)} ${formatNumber(data.count).padStart(6)} files  (${formatBytes(data.size)})`);
    });

  console.log('\n📊 BY CATEGORY:');
  console.log('─'.repeat(60));
  Object.entries(audit.byCategory)
    .sort((a, b) => b[1].count - a[1].count)
    .forEach(([cat, data]) => {
      console.log(`  ${cat.padEnd(20)} ${formatNumber(data.count).padStart(6)} files  (${formatBytes(data.size)})`);
    });

  console.log('\n✅ IMPORTABLE TO SITE:');
  console.log('─'.repeat(60));
  console.log(`  Total Ready: ${formatNumber(audit.importable.length)} photos`);
  console.log(`  Needs Processing: ${formatNumber(audit.needsProcessing.length)} photos\n`);

  console.log('🎯 RECOMMENDED PORTFOLIO IMPORTS:');
  console.log('─'.repeat(60));
  
  const sortedEvents = Object.values(byEvent).sort((a, b) => b.count - a.count);
  sortedEvents.slice(0, 20).forEach(event => {
    const avgSize = (event.totalSize / event.count / 1024 / 1024).toFixed(1);
    console.log(`\n  📁 ${event.category}/${event.eventName}`);
    console.log(`     └─ ${event.count} images, ~${avgSize}MB avg, ${event.year}`);
    console.log(`     └─ Suggested folder: "${event.category}/${event.eventName}/${event.year}"`);
  });

  if (sortedEvents.length > 20) {
    console.log(`\n  ... and ${sortedEvents.length - 20} more events`);
  }

  if (audit.needsProcessing.length > 0) {
    console.log('\n⚠️  NEEDS WEB OPTIMIZATION:');
    console.log('─'.repeat(60));
    const byReason = {};
    audit.needsProcessing.forEach(item => {
      byReason[item.reason] = (byReason[item.reason] || 0) + 1;
    });
    Object.entries(byReason).forEach(([reason, count]) => {
      console.log(`  ${reason.padEnd(20)} ${formatNumber(count).padStart(6)} files`);
    });
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    ACTION ITEMS                            ');
  console.log('═══════════════════════════════════════════════════════════\n');

  const actions = [];
  
  if (audit.importable.length > 0) {
    actions.push(`✅ ${formatNumber(audit.importable.length)} photos ready for immediate import`);
    
    // Group by category for actions
    const byCat = {};
    audit.importable.forEach(item => {
      byCat[item.category] = (byCat[item.category] || 0) + 1;
    });
    
    Object.entries(byCat).forEach(([cat, count]) => {
      actions.push(`   • ${cat}: ${formatNumber(count)} photos`);
    });
  }
  
  if (audit.needsProcessing.length > 0) {
    actions.push(`\n⚠️  ${formatNumber(audit.needsProcessing.length)} photos need web optimization`);
    actions.push(`   Run image optimization before import`);
  }

  actions.forEach(a => console.log(a));

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // Save full audit
  const reportPath = join(__dirname, '..', '..', 'updates', `exports-audit-complete-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(reportPath, JSON.stringify({
    summary: {
      totalFiles: audit.totalFiles,
      totalSize: formatBytes(audit.totalSize),
      importableCount: audit.importable.length,
      needsProcessingCount: audit.needsProcessing.length,
      byYear: audit.byYear,
      byCategory: audit.byCategory
    },
    importable: audit.importable,
    recommendedImports: sortedEvents,
    needsProcessing: audit.needsProcessing.slice(0, 100) // Limit for file size
  }, null, 2));

  console.log(`💾 Full audit saved to: ${reportPath}`);
  
  return audit;
}

fullAudit().catch(console.error);
