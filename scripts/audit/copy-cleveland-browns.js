#!/usr/bin/env node
/**
 * Copy Cleveland Browns Tailgate Photos to Portfolio
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SOURCE_BASE = 'H:\\My Drive\\03 - Multimedia\\01 - Photo\\01 - Active Projects\\Exports\\2025\\Sports\\Terrible Tailgate';
const TARGET_DIR = 'i:\\Programing\\Projects\\McCals-Website\\src\\images\\Portfolios\\Events\\Cleveland Browns at Pittsburgh Tailgate';

async function copyPhotos() {
  console.log('🟡 Copying Cleveland Browns at Pittsburgh Tailgate Photos\n');
  
  // Load album data
  const albumPath = join(__dirname, '..', '..', 'updates', 'cleveland-browns-tailgate-album.json');
  const album = JSON.parse(await fs.readFile(albumPath, 'utf-8'));
  
  console.log(`Album: ${album.name}`);
  console.log(`Photos to copy: ${album.totalImages}`);
  console.log(`Target: ${TARGET_DIR}\n`);
  
  // Find source files
  const sourceFiles = album.sourceFiles || [];
  const copied = [];
  const failed = [];
  
  for (const file of sourceFiles) {
    const sourcePath = file.sourcePath;
    const targetPath = join(TARGET_DIR, file.filename);
    
    try {
      // Check if source exists
      await fs.access(sourcePath);
      
      // Copy file
      await copyFile(sourcePath, targetPath);
      copied.push(file.filename);
      process.stdout.write('.');
    } catch (err) {
      failed.push({ file: file.filename, error: err.message });
      process.stdout.write('x');
    }
  }
  
  console.log('\n');
  console.log('═'.repeat(70));
  console.log('COPY RESULTS');
  console.log('═'.repeat(70));
  console.log(`✅ Copied: ${copied.length} photos`);
  console.log(`❌ Failed: ${failed.length} photos`);
  
  if (failed.length > 0) {
    console.log('\nFailed files:');
    failed.forEach(f => console.log(`  • ${f.file}: ${f.error}`));
  }
  
  // Save copy report
  const report = {
    album: album.name,
    copied: copied.length,
    failed: failed.length,
    failedFiles: failed,
    timestamp: new Date().toISOString()
  };
  
  const reportPath = join(__dirname, '..', '..', 'updates', 'cleveland-browns-copy-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n💾 Report saved to: updates/cleveland-browns-copy-report.json`);
}

copyPhotos().catch(console.error);
