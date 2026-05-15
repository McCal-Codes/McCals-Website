#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  return res.status === 0;
}

console.log('🔎 Running minimal smoke tests...');

// 1) Run manifest dry-run (should succeed)
console.log('\n1) Running manifest dry-run (smoke)');
if (!run('npm', ['run', 'manifest:dry'])) {
  console.error('❌ manifest:dry failed');
  process.exit(2);
}

// 2) Check the current app structure, with legacy widget support if present.
console.log('\n2) Checking app structure');
const widgetsDir = path.join(process.cwd(), 'src', 'widgets');
if (!fs.existsSync(widgetsDir)) {
  console.warn('⚠️ src/widgets directory not found; checking active Vite app instead.');

  const viteFiles = [
    path.join(process.cwd(), 'sites', 'mcc-cal-vite', 'package.json'),
    path.join(process.cwd(), 'sites', 'mcc-cal-vite', 'src', 'App.tsx'),
    path.join(process.cwd(), 'sites', 'mcc-cal-vite', 'src', 'main.tsx'),
  ];
  const missingViteFiles = viteFiles.filter(file => !fs.existsSync(file));

  if (missingViteFiles.length > 0) {
    console.error(`❌ Active Vite app files missing: ${missingViteFiles.map(file => path.relative(process.cwd(), file)).join(', ')}`);
    process.exit(3);
  }

  console.log('✅ Active Vite app structure found');
} else {
  const files = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));
  if (files.length === 0) {
    console.warn('⚠️ No standalone widget HTML files found directly under src/widgets/ — this may be OK if widgets are organized in subfolders.');
  } else {
    console.log(`✅ Found ${files.length} widget HTML files`);
  }
}

console.log('\n🎉 Minimal smoke tests passed');
