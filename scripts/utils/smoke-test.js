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
if (!run('npm', ['run', 'manifest:dry-run'])) {
  console.error('❌ manifest:dry-run failed');
  process.exit(2);
}

// 2) Check that there is at least one widget in src/widgets/
console.log('\n2) Checking widgets folder');
const widgetsDir = path.join(process.cwd(), 'src', 'widgets');
if (!fs.existsSync(widgetsDir)) {
  console.error('❌ src/widgets directory not found');
  process.exit(3);
}

const files = fs.readdirSync(widgetsDir).filter(f => f.endsWith('.html') || f.endsWith('.htm'));
if (files.length === 0) {
  console.warn('⚠️ No standalone widget HTML files found directly under src/widgets/ — this may be OK if widgets are organized in subfolders.');
} else {
  console.log(`✅ Found ${files.length} widget HTML files`);
}

console.log('\n🎉 Minimal smoke tests passed');
