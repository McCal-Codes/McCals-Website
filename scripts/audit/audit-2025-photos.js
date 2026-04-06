#!/usr/bin/env node
/**
 * Photo Audit Script for 2025 Exports
 * Analyzes photos in H:\My Drive\03 - Multimedia\01 - Photo\01 - Active Projects\Exports\2025
 * and compares against existing portfolio manifest
 */

import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXPORTS_PATH = 'H:\\My Drive\\03 - Multimedia\\01 - Photo\\01 - Active Projects\\Exports\\2025';

async function auditPhotos() {
  console.log('🔍 Starting Photo Audit for 2025 Exports\n');
  
  const audit = {
    timestamp: new Date().toISOString(),
    totalFiles: 0,
    byCategory: {},
    fileTypes: {},
    namingIssues: [],
    largeFiles: [],
    summary: {}
  };

  // Scan directory recursively
  async function scanDir(dirPath, category = 'root') {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          await scanDir(fullPath, entry.name);
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();
          const stats = await fs.stat(fullPath);
          
          // Track file types
          audit.fileTypes[ext] = (audit.fileTypes[ext] || 0) + 1;
          
          // Only process image files
          if (['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.tif'].includes(ext)) {
            audit.totalFiles++;
            
            // Track by category
            if (!audit.byCategory[category]) {
              audit.byCategory[category] = { count: 0, totalSize: 0 };
            }
            audit.byCategory[category].count++;
            audit.byCategory[category].totalSize += stats.size;
            
            // Check file size (flag files > 50MB)
            if (stats.size > 50 * 1024 * 1024) {
              audit.largeFiles.push({
                path: fullPath,
                size: formatBytes(stats.size),
                sizeBytes: stats.size
              });
            }
            
            // Check naming convention
            const namingCheck = checkNaming(entry.name, category);
            if (!namingCheck.valid) {
              audit.namingIssues.push({
                file: entry.name,
                category,
                issue: namingCheck.issue
              });
            }
          }
        }
      }
    } catch (err) {
      console.error(`❌ Error scanning ${dirPath}:`, err.message);
    }
  }

  function checkNaming(filename, _category) {
    // Expected patterns:
    // Portfolio: YYYYMMDD_Event_CAL####_webuse.jpg
    // Boyd Station: M-D-YY_Caleb McCartney_###.jpg
    
    if (filename.includes('Caleb McCartney')) {
      // Boyd Station format check
      const hasDatePattern = /^\d{1,2}-\d{1,2}-\d{2,4}/.test(filename);
      if (!hasDatePattern) {
        return { valid: false, issue: 'Missing date prefix (expected: M-D-YY)' };
      }
      return { valid: true };
    }
    
    if (filename.includes('_webuse')) {
      // Portfolio format check
      const hasDatePattern = /^\d{8}/.test(filename);
      if (!hasDatePattern) {
        return { valid: false, issue: 'Missing date prefix (expected: YYYYMMDD)' };
      }
      return { valid: true };
    }
    
    return { valid: true };
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Run audit
  await scanDir(EXPORTS_PATH);

  // Generate summary
  audit.summary = {
    totalImages: audit.totalFiles,
    categories: Object.keys(audit.byCategory).length,
    fileTypes: audit.fileTypes,
    namingIssuesCount: audit.namingIssues.length,
    largeFilesCount: audit.largeFiles.length,
    avgSizePerCategory: {}
  };

  for (const [cat, data] of Object.entries(audit.byCategory)) {
    audit.summary.avgSizePerCategory[cat] = {
      count: data.count,
      avgSize: formatBytes(data.totalSize / data.count),
      totalSize: formatBytes(data.totalSize)
    };
  }

  // Print report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                    PHOTO AUDIT REPORT                      ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`📅 Audit Date: ${new Date().toLocaleString()}`);
  console.log(`📁 Source: ${EXPORTS_PATH}`);
  console.log(`🖼️  Total Images: ${audit.totalFiles.toLocaleString()}\n`);

  console.log('📊 BY CATEGORY:');
  console.log('─'.repeat(60));
  for (const [cat, data] of Object.entries(audit.summary.avgSizePerCategory).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`  ${cat.padEnd(20)} ${data.count.toString().padStart(5)} files  (${data.avgSize} avg, ${data.totalSize} total)`);
  }

  console.log('\n📋 FILE TYPES:');
  console.log('─'.repeat(60));
  for (const [ext, count] of Object.entries(audit.fileTypes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${ext.padEnd(10)} ${count.toString().padStart(6)} files`);
  }

  if (audit.namingIssues.length > 0) {
    console.log(`\n⚠️  NAMING ISSUES (${audit.namingIssues.length}):`);
    console.log('─'.repeat(60));
    audit.namingIssues.slice(0, 10).forEach(issue => {
      console.log(`  • ${issue.file}`);
      console.log(`    └─ ${issue.issue}`);
    });
    if (audit.namingIssues.length > 10) {
      console.log(`  ... and ${audit.namingIssues.length - 10} more`);
    }
  }

  if (audit.largeFiles.length > 0) {
    console.log(`\n🐘 LARGE FILES (${audit.largeFiles.length} files > 50MB):`);
    console.log('─'.repeat(60));
    audit.largeFiles.slice(0, 10).forEach(file => {
      console.log(`  • ${basename(file.path)} (${file.size})`);
    });
    if (audit.largeFiles.length > 10) {
      console.log(`  ... and ${audit.largeFiles.length - 10} more`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    RECOMMENDATIONS                         ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Generate recommendations
  const recs = [];
  
  if (audit.byCategory['Boyd Station']) {
    const bsCount = audit.byCategory['Boyd Station'].count;
    recs.push(`• Boyd Station: ${bsCount} photos ready for portfolio import`);
    recs.push(`  - Suggest creating "Boyd Station 2025" event portfolio`);
  }
  
  if (audit.namingIssues.length > 0) {
    recs.push(`• Fix ${audit.namingIssues.length} files with non-standard naming`);
  }
  
  if (audit.largeFiles.length > 0) {
    recs.push(`• Consider compressing ${audit.largeFiles.length} large files for web use`);
  }

  const emptyCats = Object.keys(audit.byCategory).filter(cat => audit.byCategory[cat].count === 0);
  if (emptyCats.length > 0) {
    recs.push(`• Clean up empty category folders: ${emptyCats.join(', ')}`);
  }

  recs.forEach(r => console.log(r));

  if (recs.length === 0) {
    console.log('✅ No issues found! Photos are ready for portfolio import.');
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // Save audit report
  const reportPath = join(__dirname, '..', '..', 'updates', `photo-audit-2025-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(reportPath, JSON.stringify(audit, null, 2));
  console.log(`💾 Full audit saved to: ${reportPath}`);

  return audit;
}

auditPhotos().catch(console.error);
