#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Validates HTML structure in widget files
 * Checks for proper HTML DOCTYPE or html tag
 */

function validateWidgetHTML() {
  const widgetsDir = path.join(__dirname, '..', '..', 'src', 'widgets');

  if (!fs.existsSync(widgetsDir)) {
    console.error('❌ Widgets directory not found: - validate-widget-html.js:15', widgetsDir);
    process.exit(1);
  }

  console.log('🔍 Validating widget HTML files...\n - validate-widget-html.js:19');

  let totalFiles = 0;
  let validFiles = 0;
  let invalidFiles = [];

  function validateFile(filePath) {
    totalFiles++;
    console.log(`Validating: ${filePath} - validate-widget-html.js:27`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Check for HTML structure
      if (content.includes('<!DOCTYPE html>') || content.includes('<html')) {
        console.log('✅ Valid HTML structure - validate-widget-html.js:34');
        validFiles++;
      } else {
        console.log('❌ Missing HTML structure - validate-widget-html.js:37');
        invalidFiles.push(filePath);
      }
    } catch (error) {
      console.log(`❌ Error reading file: ${error.message} - validate-widget-html.js:41`);
      invalidFiles.push(filePath);
    }
  }

  function walkDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDirectory(fullPath);
      } else if (item.endsWith('.html')) {
        validateFile(fullPath);
      }
    }
  }

  walkDirectory(widgetsDir);

  console.log(`\n📊 Validation Summary: - validate-widget-html.js:63`);
  console.log(`Total HTML files: ${totalFiles} - validate-widget-html.js:64`);
  console.log(`Valid files: ${validFiles} - validate-widget-html.js:65`);
  console.log(`Invalid files: ${invalidFiles.length} - validate-widget-html.js:66`);

  if (invalidFiles.length > 0) {
    console.log('\n❌ Invalid files: - validate-widget-html.js:69');
    invalidFiles.forEach(file => console.log(`${file} - validate-widget-html.js:70`));
    process.exit(1);
  } else {
    console.log('\n✅ All widget HTML files are valid! - validate-widget-html.js:73');
  }
}

if (require.main === module) {
  validateWidgetHTML();
}

module.exports = { validateWidgetHTML };