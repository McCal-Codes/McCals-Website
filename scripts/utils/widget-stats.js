#!/usr/bin/env node

/**
 * Widget Statistics Generator
 * Provides insights into widget versions, sizes, and usage
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function getDirectorySize(dirPath) {
  let totalSize = 0;

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    items.forEach((item) => {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        traverse(itemPath);
      } else {
        totalSize += stats.size;
      }
    });
  }

  try {
    traverse(dirPath);
  } catch (error) {
    // Directory doesn't exist or not accessible
  }

  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getWidgetStats() {
  const widgetsDir = path.join(process.cwd(), 'src', 'widgets');

  if (!fs.existsSync(widgetsDir)) {
    log('❌ Widgets directory not found', 'red');
    return;
  }

  log('\n📊 Widget Statistics', 'cyan');
  log('='.repeat(80), 'cyan');
  log('');

  const widgets = fs.readdirSync(widgetsDir).filter((item) => {
    const itemPath = path.join(widgetsDir, item);
    return fs.statSync(itemPath).isDirectory() && !item.startsWith('_');
  });

  let totalWidgets = 0;
  let totalVersions = 0;
  let totalSize = 0;
  const widgetDetails = [];

  widgets.forEach((widget) => {
    const widgetPath = path.join(widgetsDir, widget);
    const versionsPath = path.join(widgetPath, 'versions');

    let versions = 0;
    if (fs.existsSync(versionsPath)) {
      versions = fs.readdirSync(versionsPath).filter((f) => f.endsWith('.html')).length;
    }

    const size = getDirectorySize(widgetPath);
    const hasReadme = fs.existsSync(path.join(widgetPath, 'README.md'));
    const hasChangelog = fs.existsSync(path.join(widgetPath, 'CHANGELOG.md'));

    totalWidgets++;
    totalVersions += versions;
    totalSize += size;

    widgetDetails.push({
      name: widget,
      versions,
      size,
      hasReadme,
      hasChangelog,
    });
  });

  // Sort by size descending
  widgetDetails.sort((a, b) => b.size - a.size);

  // Display summary
  log('📈 Summary', 'cyan');
  log(`Total Widgets: ${totalWidgets}`, 'green');
  log(`Total Versions: ${totalVersions}`, 'green');
  log(`Total Size: ${formatBytes(totalSize)}`, 'green');
  log(`Average Versions per Widget: ${(totalVersions / totalWidgets).toFixed(1)}`, 'green');
  log('');

  // Display widget details
  log('📦 Widget Details', 'cyan');
  log('-'.repeat(80), 'cyan');
  log(`${'Widget'.padEnd(30)} ${'Versions'.padEnd(10)} ${'Size'.padEnd(12)} ${'Docs'}`, 'yellow');
  log('-'.repeat(80), 'cyan');

  widgetDetails.forEach((widget) => {
    const docs = [widget.hasReadme ? '📄' : '  ', widget.hasChangelog ? '📋' : '  '].join(' ');

    log(
      `${widget.name.padEnd(30)} ${widget.versions.toString().padEnd(10)} ${formatBytes(
        widget.size
      ).padEnd(12)} ${docs}`,
      'blue'
    );
  });

  log('');
  log('Legend: 📄 README.md  📋 CHANGELOG.md', 'yellow');
  log('');

  // Find widgets without proper documentation
  const missingDocs = widgetDetails.filter((w) => !w.hasReadme || !w.hasChangelog);
  if (missingDocs.length > 0) {
    log('⚠️  Widgets Missing Documentation:', 'yellow');
    missingDocs.forEach((w) => {
      const missing = [];
      if (!w.hasReadme) missing.push('README.md');
      if (!w.hasChangelog) missing.push('CHANGELOG.md');
      log(`   ${w.name}: missing ${missing.join(', ')}`, 'yellow');
    });
    log('');
  }

  // Find largest widgets
  log('📦 Largest Widgets:', 'cyan');
  widgetDetails.slice(0, 5).forEach((w, i) => {
    log(`   ${i + 1}. ${w.name}: ${formatBytes(w.size)}`, 'blue');
  });
  log('');

  // Version distribution
  const versionDistribution = {};
  widgetDetails.forEach((w) => {
    const key = w.versions === 0 ? '0' : w.versions <= 2 ? '1-2' : w.versions <= 5 ? '3-5' : '6+';
    versionDistribution[key] = (versionDistribution[key] || 0) + 1;
  });

  log('📊 Version Distribution:', 'cyan');
  Object.entries(versionDistribution)
    .sort(([a], [b]) => {
      const order = { 0: 0, '1-2': 1, '3-5': 2, '6+': 3 };
      return order[a] - order[b];
    })
    .forEach(([range, count]) => {
      log(`   ${range} versions: ${count} widgets`, 'blue');
    });
  log('');
}

// Run stats
try {
  getWidgetStats();
} catch (error) {
  log(`❌ Error generating stats: ${error.message}`, 'red');
  process.exit(1);
}
