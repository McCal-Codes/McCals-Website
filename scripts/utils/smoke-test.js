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

// 2) Check that the current public app surface exists.
console.log('\n2) Checking active Vite app');
const viteAppDir = path.join(process.cwd(), 'sites', 'mcc-cal-vite');
const vitePackage = path.join(viteAppDir, 'package.json');
const viteRouter = path.join(viteAppDir, 'src', 'App.tsx');

if (!fs.existsSync(vitePackage)) {
  console.error('❌ sites/mcc-cal-vite/package.json not found');
  process.exit(3);
}

if (!fs.existsSync(viteRouter)) {
  console.error('❌ sites/mcc-cal-vite/src/App.tsx not found');
  process.exit(4);
}

console.log('✅ Active Vite app files found');

console.log('\n🎉 Minimal smoke tests passed');
