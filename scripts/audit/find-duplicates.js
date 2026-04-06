#!/usr/bin/env node
/**
 * Duplicate Photo Detection
 * Scans Exports folder for duplicate or similar photos
 */

import { promises as fs } from 'fs';
import { join, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXPORTS_PATH = 'H:\\My Drive\\03 - Multimedia\\01 - Photo\\01 - Active Projects\\Exports';

async function findDuplicates() {
  console.log('🔍 Scanning for Duplicate Photos\n');
  
  const files = [];
  const duplicates = {
    byName: new Map(),
    byBaseName: new Map(),
    bySize: new Map(),
    potentialVariants: []
  };

  // Collect all files
  async function collectFiles(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await collectFiles(fullPath);
        } else if (entry.isFile()) {
          const ext = extname(entry.name).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
            try {
              const stats = await fs.stat(fullPath);
              files.push({
                name: entry.name,
                path: fullPath,
                size: stats.size,
                ext
              });
            } catch {}
          }
        }
      }
    } catch {
      // Ignore errors for directories we can't read
    }
  }
  console.log(`📁 Collected ${files.length.toLocaleString()} image files\n`);

  // Find duplicates by exact filename
  files.forEach(file => {
    const existing = duplicates.byName.get(file.name) || [];
    existing.push(file);
    duplicates.byName.set(file.name, existing);
  });

  // Find duplicates by base name (before suffixes like "_webuse", " 1", etc)
  files.forEach(file => {
    // Extract base: remove extensions, _webuse, numbers in parentheses, " 1", " 2", etc
    let baseName = file.name
      .replace(/\.[^.]+$/, '')
      .replace(/_webuse$/i, '')
      .replace(/_webuse \d+$/i, '')
      .replace(/ \d+$/, '')
      .replace(/ \(\d+\)$/, '')
      .replace(/_\d+$/, '')
      .toLowerCase();
    
    const existing = duplicates.byBaseName.get(baseName) || [];
    existing.push(file);
    duplicates.byBaseName.set(baseName, existing);
  });

  // Find duplicates by exact file size (potential exact duplicates)
  files.forEach(file => {
    const existing = duplicates.bySize.get(file.size) || [];
    existing.push(file);
    duplicates.bySize.set(file.size, existing);
  });

  // Find "number suffix" variants (e.g., "file.jpg" vs "file 1.jpg")
  files.forEach(file => {
    const match = file.name.match(/^(.*?)\s+(\d+)(\.[^.]+)?$/);
    if (match) {
      const baseName = match[1] + (match[3] || '');
      const original = files.find(f => f.name === baseName || f.name === match[1] + (match[3] || ''));
      if (original) {
        duplicates.potentialVariants.push({
          original: original.path,
          variant: file.path,
          type: 'numbered-suffix'
        });
      }
    }
  });

  // Report Results
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  DUPLICATE DETECTION REPORT                ');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Exact filename duplicates
  const exactDupes = [...duplicates.byName.entries()].filter(([_, items]) => items.length > 1);
  console.log(`🔴 EXACT FILENAME DUPLICATES: ${exactDupes.length} sets`);
  console.log('─'.repeat(60));
  exactDupes.forEach(([name, items]) => {
    console.log(`\n  📄 "${name}" (${items.length} copies)`);
    items.forEach(item => {
      console.log(`     • ${item.path.replace(EXPORTS_PATH, '')}`);
    });
  });

  // Base name variants (same photo, different versions)
  const baseVariants = [...duplicates.byBaseName.entries()]
    .filter(([_, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log(`\n\n🟡 BASE NAME VARIANTS: ${baseVariants.length} sets`);
  console.log('─'.repeat(60));
  baseVariants.slice(0, 30).forEach(([base, items]) => {
    console.log(`\n  📁 "${base}" (${items.length} variants)`);
    items.forEach(item => {
      const shortPath = item.path.replace(EXPORTS_PATH, '');
      console.log(`     • ${shortPath}`);
    });
  });
  if (baseVariants.length > 30) {
    console.log(`\n  ... and ${baseVariants.length - 30} more sets`);
  }

  // Size-based duplicates (potential exact copies)
  const sizeDupes = [...duplicates.bySize.entries()]
    .filter(([_, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length);
  
  console.log(`\n\n🔵 SAME SIZE (Potential Exact Duplicates): ${sizeDupes.length} sets`);
  console.log('─'.repeat(60));
  sizeDupes.slice(0, 20).forEach(([size, items]) => {
    console.log(`\n  💾 ${(size / 1024 / 1024).toFixed(2)}MB (${items.length} files)`);
    items.slice(0, 5).forEach(item => {
      console.log(`     • ${item.name}`);
    });
    if (items.length > 5) {
      console.log(`     ... and ${items.length - 5} more`);
    }
  });

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                      SUMMARY                              ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const totalExactDupes = exactDupes.reduce((sum, [_, items]) => sum + items.length - 1, 0);
  const totalBaseVariants = baseVariants.reduce((sum, [_, items]) => sum + items.length, 0);
  const potentialWaste = sizeDupes.reduce((sum, [size, items]) => sum + (size * (items.length - 1)), 0);

  console.log(`📊 Statistics:`);
  console.log(`  • Total files scanned: ${files.length.toLocaleString()}`);
  console.log(`  • Exact filename duplicates: ${totalExactDupes} files in ${exactDupes.length} sets`);
  console.log(`  • Base name variants: ${totalBaseVariants} files in ${baseVariants.length} sets`);
  console.log(`  • Same-size files: ${sizeDupes.reduce((s, [_, i]) => s + i.length, 0)} files`);
  console.log(`  • Potential wasted space: ${(potentialWaste / 1024 / 1024 / 1024).toFixed(2)} GB\n`);

  // Save report
  const report = {
    scannedFiles: files.length,
    exactDuplicates: exactDupes.map(([name, items]) => ({ name, items })),
    baseVariants: baseVariants.slice(0, 100).map(([base, items]) => ({ baseName: base, items })),
    sizeDuplicates: sizeDupes.slice(0, 100).map(([size, items]) => ({ size, items })),
    summary: {
      totalExactDuplicates: totalExactDupes,
      totalBaseVariants,
      potentialWasteGB: (potentialWaste / 1024 / 1024 / 1024).toFixed(2)
    }
  };

  const reportPath = join(__dirname, '..', '..', 'updates', `duplicate-report-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Report saved to: ${reportPath}`);
}

findDuplicates().catch(console.error);
