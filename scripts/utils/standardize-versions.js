#!/usr/bin/env node

/**
 * Standardize Version Numbers Across Repository
 * @version 1.0.0
 * 
 * Converts all version numbers to proper semantic versioning (x.x.0 format)
 * in widget files, scripts, and documentation.
 * 
 * This ensures version dropdowns work correctly and maintains consistency.
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const VERBOSE = process.argv.includes('--verbose') || DRY_RUN;

// Tracking
const changes = [];
const errors = [];

// Version patterns to fix
const VERSION_PATTERNS = [
  // Widget HTML headers: "Version: 1.4" → "Version: 1.4.0"
  { 
    pattern: /^(\s*Version:\s+)(\d+\.\d+)(\s*$)/gm,
    replacement: '$11.$2.0$3',
    description: 'Widget version header'
  },
  // JSDoc @version: "@version 1.0" → "@version 1.0.0"
  {
    pattern: /(@version\s+)(\d+)\.(\d+)(\s)/g,
    replacement: '$1$2.$3.0$4',
    description: 'JSDoc @version tag'
  },
  // JSON version fields: "version": "1.0" → "version": "1.0.0"
  {
    pattern: /("version"\s*:\s*")(\d+)\.(\d+)(")/g,
    replacement: '$1$2.$3.0$4',
    description: 'JSON version field'
  },
  // JS version assignments: version: '2.6' → version: '2.6.0'
  {
    pattern: /(version:\s*['"])(\d+)\.(\d+)(['"])/g,
    replacement: '$1$2.$3.0$4',
    description: 'JS version assignment'
  }
];

// Files/directories to process
const TARGETS = [
  'src/widgets',
  'scripts',
  'package.json'
];

// Files to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.git/,
  /dist/,
  /logs/,
  /_archived/,
  /\.md$/,  // Skip markdown (CHANGELOGs handled separately)
  /\.json$/  // Skip JSON for now (needs careful handling)
];

function shouldSkip(filePath) {
  return SKIP_PATTERNS.some(pattern => pattern.test(filePath));
}

function processFile(filePath) {
  try {
    if (shouldSkip(filePath)) {
      if (VERBOSE) console.log(`⏭️  Skipping: ${filePath} - standardize-versions.js:76`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileChanges = [];

    for (const { pattern, replacement, description } of VERSION_PATTERNS) {
      const before = content;
      content = content.replace(pattern, replacement);
      
      if (content !== before) {
        modified = true;
        const matches = (before.match(pattern) || []).length;
        fileChanges.push({ description, matches });
      }
    }

    if (modified) {
      changes.push({
        file: filePath,
        changes: fileChanges
      });

      if (!DRY_RUN) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${filePath} - standardize-versions.js:103`);
      } else {
        console.log(`🔍 Would update: ${filePath} - standardize-versions.js:105`);
      }
      
      if (VERBOSE) {
        fileChanges.forEach(({ description, matches }) => {
          console.log(`${description}: ${matches} change(s) - standardize-versions.js:110`);
        });
      }
    }
  } catch (err) {
    errors.push({ file: filePath, error: err.message });
    console.error(`❌ Error processing ${filePath}: ${err.message} - standardize-versions.js:116`);
  }
}

function walkDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!shouldSkip(fullPath)) {
          walkDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        // Process HTML, JS files
        if (/\.(html|js)$/.test(entry.name)) {
          processFile(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`❌ Error reading directory ${dir}: ${err.message} - standardize-versions.js:139`);
  }
}

// Main execution
console.log('🔧 Standardizing version numbers to x.x.0 format...\n - standardize-versions.js:144');

if (DRY_RUN) {
  console.log('🔍 DRY RUN MODE  No files will be modified\n - standardize-versions.js:147');
}

// Process all targets
for (const target of TARGETS) {
  const targetPath = path.join(__dirname, '../..', target);
  
  if (!fs.existsSync(targetPath)) {
    console.warn(`⚠️  Target not found: ${target} - standardize-versions.js:155`);
    continue;
  }

  console.log(`📂 Processing: ${target} - standardize-versions.js:159`);
  
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    walkDirectory(targetPath);
  } else if (stat.isFile()) {
    processFile(targetPath);
  }
}

// Summary
console.log('\n - standardize-versions.js:170' + '='.repeat(60));
console.log('📊 Version Standardization Summary - standardize-versions.js:171');
console.log('= - standardize-versions.js:172'.repeat(60));

if (changes.length > 0) {
  console.log(`\n✅ Files ${DRY_RUN ? 'to update' : 'updated'}: ${changes.length} - standardize-versions.js:175`);
  
  const totalChanges = changes.reduce((sum, { changes: c }) => 
    sum + c.reduce((s, { matches }) => s + matches, 0), 0);
  console.log(`Total version fixes: ${totalChanges} - standardize-versions.js:179`);
  
  if (VERBOSE) {
    console.log('\n📝 Detailed changes: - standardize-versions.js:182');
    changes.forEach(({ file, changes: c }) => {
      console.log(`\n   ${path.relative(process.cwd(), file)} - standardize-versions.js:184`);
      c.forEach(({ description, matches }) => {
        console.log(`${description}: ${matches} - standardize-versions.js:186`);
      });
    });
  }
} else {
  console.log('\n✨ No version standardization needed  all versions already in x.x.0 format! - standardize-versions.js:191');
}

if (errors.length > 0) {
  console.log(`\n❌ Errors encountered: ${errors.length} - standardize-versions.js:195`);
  errors.forEach(({ file, error }) => {
    console.log(`${path.relative(process.cwd(), file)}: ${error} - standardize-versions.js:197`);
  });
}

console.log('\n - standardize-versions.js:201' + '='.repeat(60));

if (DRY_RUN && changes.length > 0) {
  console.log('\n💡 Run without dryrun to apply changes: - standardize-versions.js:204');
  console.log('node scripts/utils/ - standardize-versions.js:205');
}

// Exit with error code if errors occurred
process.exit(errors.length > 0 ? 1 : 0);
