#!/usr/bin/env node

/**
 * Concert Refresh Command
 * 
 * Quick command to regenerate all concert manifests when you add new bands or images.
 * Perfect for when the watcher isn't running or you want to manually refresh.
 * 
 * Usage: node scripts/refresh-concerts.js
 */

const { execSync } = require('child_process');

function log(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] 🎸 ${message}`, ...args);
}

function success(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ✅ ${message}`, ...args);
}

function error(message, ...args) {
  const timestamp = new Date().toLocaleTimeString();
  console.error(`[${timestamp}] ❌ ${message}`, ...args);
}

async function refreshConcerts() {
  log('Refreshing all concert manifests...');
  
  try {
    // Generate individual manifests first
    log('Generating individual folder manifests...');
    execSync('node scripts/generate-individual-manifests.js', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    // Generate master concert manifest
    log('Generating master concert manifest...');
    execSync('node scripts/generate-concert-manifest.js', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    success('🎸 All concert manifests refreshed successfully!');
    success('New bands and images should now appear in your widget!');
    
  } catch (err) {
    error('Failed to refresh concert manifests:', err.message);
    process.exit(1);
  }
}

// CLI handling
const args = process.argv.slice(2);
const help = args.includes('--help') || args.includes('-h');

if (help) {
  console.log(`
🎸 Concert Refresh Command

Quick command to regenerate all concert manifests when you add new bands or images.

Usage:
  node scripts/refresh-concerts.js
  npm run refresh:concerts

Features:
  • Generates individual manifest.json files in each band/date folder
  • Regenerates master concert manifest for the widget
  • Detects new bands automatically
  • Perfect for when the watcher isn't running

Examples:
  # After adding a new band folder with images
  node scripts/refresh-concerts.js
  
  # Or use npm script (if configured)
  npm run refresh:concerts
`);
  process.exit(0);
}

// Run the refresh
refreshConcerts();