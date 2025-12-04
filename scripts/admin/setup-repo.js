#!/usr/bin/env node

/**
 * Setup script for repository hooks and automation
 * Run this after cloning or to re-enable git hooks
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

console.log('🔧 Setting up McCal Media repository...\n');

// 1. Configure git hooks
try {
  console.log('📌 Configuring git hooks...');
  execSync('git config core.hooksPath .githooks', { cwd: ROOT });
  
  // Make hooks executable
  const hooksDir = path.join(ROOT, '.githooks');
  if (fs.existsSync(hooksDir)) {
    const hooks = fs.readdirSync(hooksDir).filter(f => !f.includes('README'));
    hooks.forEach(hook => {
      const hookPath = path.join(hooksDir, hook);
      if (!fs.statSync(hookPath).isDirectory()) {
        fs.chmodSync(hookPath, 0o755);
      }
    });
    console.log(`   ✓ Enabled ${hooks.length} git hook(s)`);
  }
} catch (err) {
  console.error('   ⚠ Failed to configure git hooks:', err.message);
}

// 2. Run initial welcome
try {
  console.log('\n📋 Generating welcome dashboard...');
  execSync('npm run welcome --silent', { cwd: ROOT, stdio: 'inherit' });
  console.log('   ✓ Dashboard created at updates/welcome.md');
} catch (err) {
  console.error('   ⚠ Failed to generate welcome:', err.message);
}

// 3. Check for manifests
try {
  console.log('\n📦 Checking portfolio manifests...');
  const manifestPaths = [
    'src/images/Portfolios/Concert/concert-manifest.json',
    'src/images/Portfolios/Events/events-manifest.json',
    'src/images/Portfolios/Portrait/portrait-manifest.json',
  ];
  
  let missing = 0;
  manifestPaths.forEach(p => {
    if (!fs.existsSync(path.join(ROOT, p))) {
      missing++;
    }
  });
  
  if (missing > 0) {
    console.log(`   ⚠ ${missing} manifest(s) missing - run: npm run manifest:generate`);
  } else {
    console.log('   ✓ All core manifests found');
  }
} catch (err) {
  console.error('   ⚠ Failed to check manifests:', err.message);
}

// 4. Summary
console.log('\n✅ Setup complete!\n');
console.log('📝 Useful commands:');
console.log('   npm run welcome          - Update dashboard');
console.log('   npm run welcome:open     - Open dashboard in editor');
console.log('   npm run dev:with-api     - Start dev server with API');
console.log('   npm run manifest:generate - Generate all manifests');
console.log('\n💡 Tip: Pin updates/welcome.md in VS Code for quick access!');
console.log('');
