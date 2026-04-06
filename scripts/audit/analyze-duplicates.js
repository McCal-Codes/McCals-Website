#!/usr/bin/env node
/**
 * Duplicate Analysis from Audit Data
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function analyzeDuplicates() {
  const auditPath = join(__dirname, '..', '..', 'updates', 'exports-audit-complete-2026-04-06.json');
  const audit = JSON.parse(await fs.readFile(auditPath, 'utf-8'));
  
  const files = audit.importable.concat(audit.needsProcessing);
  console.log(`Analyzing ${files.length.toLocaleString()} files for duplicates...\n`);

  // 1. Find exact filename duplicates
  const byName = {};
  files.forEach(f => {
    if (!byName[f.filename]) byName[f.filename] = [];
    byName[f.filename].push(f);
  });
  const exactDupes = Object.entries(byName).filter(([_, items]) => items.length > 1);

  // 2. Find base name variants
  const byBase = {};
  files.forEach(f => {
    let base = f.filename
      .replace(/\.[^.]+$/, '')
      .replace(/_webuse$/i, '')
      .replace(/_webuse \d+$/i, '')
      .replace(/ \d+$/, '')
      .replace(/ \(\d+\)$/, '')
      .toLowerCase();
    
    if (!byBase[base]) byBase[base] = [];
    byBase[base].push(f);
  });
  const variants = Object.entries(byBase)
    .filter(([_, items]) => items.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  // 3. Find size duplicates
  const bySize = {};
  files.forEach(f => {
    if (!bySize[f.sizeBytes]) bySize[f.sizeBytes] = [];
    bySize[f.sizeBytes].push(f);
  });
  const sizeDupes = Object.entries(bySize).filter(([_, items]) => items.length > 1);

  // Report
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  DUPLICATE ANALYSIS                        ');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`🔴 EXACT FILENAME DUPLICATES: ${exactDupes.length} sets`);
  console.log('─'.repeat(60));
  if (exactDupes.length === 0) {
    console.log('  ✅ No exact filename duplicates found!');
  } else {
    exactDupes.forEach(([name, items]) => {
      console.log(`\n  📄 "${name}" (${items.length} copies)`);
      items.forEach(item => {
        console.log(`     • ${item.fullPath.replace(/.*Exports/, 'Exports')}`);
      });
    });
  }

  console.log(`\n\n🟡 BASE NAME VARIANTS: ${variants.length} sets`);
  console.log('─'.repeat(60));
  console.log('   (Same photo, different versions - webuse, numbered, etc)\n');
  
  if (variants.length === 0) {
    console.log('  ✅ No base name variants found!');
  } else {
    variants.slice(0, 20).forEach(([base, items]) => {
      console.log(`\n  📁 "${base}" (${items.length} versions)`);
      items.slice(0, 5).forEach(item => {
        console.log(`     • ${item.filename} (${item.sizeMB}MB) ${item.isWebOptimized ? '[_webuse]' : ''}`);
      });
      if (items.length > 5) {
        console.log(`     ... and ${items.length - 5} more`);
      }
    });
    if (variants.length > 20) {
      console.log(`\n  ... and ${variants.length - 20} more variant sets`);
    }
  }

  console.log(`\n\n🔵 SAME SIZE FILES: ${sizeDupes.length} sets`);
  console.log('─'.repeat(60));
  console.log('   (Potential exact duplicates based on file size)\n');
  
  if (sizeDupes.length === 0) {
    console.log('  ✅ No same-size files found!');
  } else {
    sizeDupes.slice(0, 15).forEach(([size, items]) => {
      const sizeMB = (size / 1024 / 1024).toFixed(2);
      console.log(`\n  💾 ${sizeMB}MB (${items.length} files)`);
      items.slice(0, 3).forEach(item => {
        console.log(`     • ${item.filename}`);
      });
      if (items.length > 3) {
        console.log(`     ... and ${items.length - 3} more`);
      }
    });
  }

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                      SUMMARY                              ');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Calculate wasted space
  let wastedSpace = 0;
  exactDupes.forEach(([_, items]) => {
    const sizes = items.map(i => i.sizeBytes);
    const maxSize = Math.max(...sizes);
    const totalSize = sizes.reduce((a, b) => a + b, 0);
    wastedSpace += (totalSize - maxSize);
  });

  console.log(`📊 Statistics:`);
  console.log(`  • Total files analyzed: ${files.length.toLocaleString()}`);
  console.log(`  • Exact filename duplicates: ${exactDupes.length} sets`);
  console.log(`  • Base name variants: ${variants.length} sets`);
  console.log(`  • Same-size files: ${sizeDupes.length} sets`);
  console.log(`  • Wasted space from exact dupes: ${(wastedSpace/1024/1024).toFixed(2)} MB`);

  // Actionable recommendations
  console.log(`\n🎯 RECOMMENDATIONS:`);
  if (variants.length > 0) {
    const webuseCount = files.filter(f => f.isWebOptimized).length;
    console.log(`  • ${webuseCount} photos have _webuse suffix (web-optimized)`);
    console.log(`  • ${files.length - webuseCount} photos may need optimization`);
    console.log(`  • Consolidate variant sets before importing to site`);
  }
  if (exactDupes.length > 0) {
    console.log(`  • Remove exact duplicates to save ${(wastedSpace/1024/1024).toFixed(2)} MB`);
  }

  console.log('\n═══════════════════════════════════════════════════════════\n');

  // Save report
  const report = {
    totalFiles: files.length,
    exactDuplicates: exactDupes.map(([name, items]) => ({ name, items })),
    baseVariants: variants.slice(0, 50).map(([base, items]) => ({ base, items })),
    sizeDuplicates: sizeDupes.slice(0, 50).map(([size, items]) => ({ size, items })),
    summary: {
      exactDupeSets: exactDupes.length,
      variantSets: variants.length,
      sizeDupeSets: sizeDupes.length,
      wastedSpaceMB: (wastedSpace/1024/1024).toFixed(2)
    }
  };

  const reportPath = join(__dirname, '..', '..', 'updates', `duplicate-analysis-${new Date().toISOString().split('T')[0]}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`💾 Report saved to: ${reportPath}`);
}

analyzeDuplicates().catch(console.error);
