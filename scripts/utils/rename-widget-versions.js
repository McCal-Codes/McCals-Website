#!/usr/bin/env node

/**
 * Rename Widget Version Files to Standardized Format
 * @version 1.0.0
 * 
 * Renames widget version files from v1.1.html to v1.1.0.html format
 * ensuring consistency with semantic versioning standards.
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || DRY_RUN;

const renames = [];
const errors = [];
const skipped = [];

// Widgets to process
const WIDGETS_DIR = path.join(__dirname, '../../src/widgets');

// Pattern to match: vX.Y.html (without .0)
const VERSION_FILE_PATTERN = /^v(\d+)\.(\d+)\.html$/;
const VERSION_FILE_WITH_SUFFIX = /^v(\d+)\.(\d+)-(.+)\.html$/;

function shouldRename(filename) {
  // Match v1.1.html pattern (needs .0)
  if (VERSION_FILE_PATTERN.test(filename)) {
    return true;
  }
  // Match v1.1-suffix.html pattern (needs .0)
  if (VERSION_FILE_WITH_SUFFIX.test(filename)) {
    return true;
  }
  return false;
}

function getNewFilename(oldFilename) {
  // v1.1.html → v1.1.0.html
  if (VERSION_FILE_PATTERN.test(oldFilename)) {
    return oldFilename.replace(VERSION_FILE_PATTERN, 'v$1.$2.0.html');
  }
  // v1.1-suffix.html → v1.1.0-suffix.html
  if (VERSION_FILE_WITH_SUFFIX.test(oldFilename)) {
    return oldFilename.replace(VERSION_FILE_WITH_SUFFIX, 'v$1.$2.0-$3.html');
  }
  return null;
}

function processVersionsDirectory(versionsPath, widgetName) {
  try {
    if (!fs.existsSync(versionsPath)) {
      return;
    }

    const files = fs.readdirSync(versionsPath);
    
    for (const file of files) {
      if (!file.endsWith('.html')) continue;
      
      if (shouldRename(file)) {
        const newFilename = getNewFilename(file);
        
        if (!newFilename) {
          skipped.push({ widget: widgetName, file, reason: 'Could not determine new name' });
          continue;
        }
        
        const oldPath = path.join(versionsPath, file);
        const newPath = path.join(versionsPath, newFilename);
        
        // Check if new file already exists
        if (fs.existsSync(newPath)) {
          skipped.push({ widget: widgetName, file, reason: `Target ${newFilename} already exists` });
          continue;
        }
        
        renames.push({
          widget: widgetName,
          oldName: file,
          newName: newFilename,
          oldPath,
          newPath
        });
        
        if (!DRY_RUN) {
          fs.renameSync(oldPath, newPath);
          if (VERBOSE) {
            console.log(`✅ ${widgetName}: ${file} → ${newFilename}`);
          }
        } else {
          console.log(`🔍 ${widgetName}: ${file} → ${newFilename}`);
        }
      }
    }
  } catch (err) {
    errors.push({ widget: widgetName, error: err.message });
    console.error(`❌ Error processing ${widgetName}: ${err.message}`);
  }
}

function walkWidgets(widgetsDir) {
  try {
    const entries = fs.readdirSync(widgetsDir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      
      const widgetPath = path.join(widgetsDir, entry.name);
      const versionsPath = path.join(widgetPath, 'versions');
      
      processVersionsDirectory(versionsPath, entry.name);
      
      // Check nested structure (e.g., about/complete-about-page)
      const nestedEntries = fs.readdirSync(widgetPath, { withFileTypes: true });
      for (const nested of nestedEntries) {
        if (nested.isDirectory() && nested.name !== 'versions') {
          const nestedVersionsPath = path.join(widgetPath, nested.name, 'versions');
          processVersionsDirectory(nestedVersionsPath, `${entry.name}/${nested.name}`);
        }
      }
    }
  } catch (err) {
    console.error(`❌ Error walking widgets directory: ${err.message}`);
  }
}

// Main execution
console.log('📝 Renaming widget version files to x.x.0 format...\n');

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE - No files will be renamed\n');
}

walkWidgets(WIDGETS_DIR);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Widget Version Renaming Summary');
console.log('='.repeat(60));

if (renames.length > 0) {
  console.log(`\n✅ Files ${DRY_RUN ? 'to rename' : 'renamed'}: ${renames.length}`);
  
  // Group by widget
  const byWidget = {};
  renames.forEach(r => {
    if (!byWidget[r.widget]) byWidget[r.widget] = [];
    byWidget[r.widget].push(r);
  });
  
  if (VERBOSE) {
    console.log('\n📝 Detailed renames:');
    Object.keys(byWidget).sort().forEach(widget => {
      console.log(`\n   ${widget}:`);
      byWidget[widget].forEach(({ oldName, newName }) => {
        console.log(`     ${oldName} → ${newName}`);
      });
    });
  } else {
    console.log('\n   By widget:');
    Object.keys(byWidget).sort().forEach(widget => {
      console.log(`     ${widget}: ${byWidget[widget].length} file(s)`);
    });
  }
} else {
  console.log('\n✨ No files need renaming - all already in x.x.0 format!');
}

if (skipped.length > 0) {
  console.log(`\n⏭️  Skipped: ${skipped.length} file(s)`);
  if (VERBOSE) {
    skipped.forEach(({ widget, file, reason }) => {
      console.log(`   ${widget}/${file}: ${reason}`);
    });
  }
}

if (errors.length > 0) {
  console.log(`\n❌ Errors encountered: ${errors.length}`);
  errors.forEach(({ widget, error }) => {
    console.log(`   ${widget}: ${error}`);
  });
}

console.log('\n' + '='.repeat(60));

if (DRY_RUN && renames.length > 0) {
  console.log('\n💡 Run without --dry-run to apply renames:');
  console.log('   npm run versions:rename');
}

if (!DRY_RUN && renames.length > 0) {
  console.log('\n💡 Don\'t forget to:');
  console.log('   1. Update any references to renamed files');
  console.log('   2. Update README files if they reference specific versions');
  console.log('   3. Commit the changes: git add -A && git commit -m "chore: rename widget versions to x.x.0 format"');
}

process.exit(errors.length > 0 ? 1 : 0);
