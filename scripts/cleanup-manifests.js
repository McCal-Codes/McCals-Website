#!/usr/bin/env node
/**
 * Cleanup Old Manifests - Remove conflicting legacy manifest files
 * 
 * This script removes old manifest.json files from band root directories
 * when those bands have organized subdirectories with their own manifests.
 * This prevents conflicts where the widget might load the wrong manifest.
 * 
 * Usage:
 *   node scripts/cleanup-manifests.js
 *   node scripts/cleanup-manifests.js --dry   (preview mode)
 * 
 * Author: McCal-Codes
 * Version: 1.0
 */

const { cleanupOldManifests } = require('./enhanced-manifest-generator');
const path = require('path');

async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Cleanup Old Manifests

Usage:
  node cleanup-manifests.js           Clean up conflicting manifests
  node cleanup-manifests.js --dry     Preview what would be cleaned
  node cleanup-manifests.js --help    Show this help

This script removes old manifest.json files from band root directories
when those bands have organized subdirectories (like "August 2025", "December 2024").

This prevents conflicts where the concert widget might load outdated
manifest files with incorrect image paths.
        `);
        return;
    }
    
    const options = {
        dryRun: args.includes('--dry'),
        verbose: true
    };
    
    console.log('🧹 Concert Manifest Cleanup Tool');
    console.log(`Mode: ${options.dryRun ? 'DRY RUN (preview only)' : 'LIVE (will make changes)'}`);
    console.log('');
    
    const concertBaseDir = path.resolve(__dirname, '../images/Portfolios/Concert');
    cleanupOldManifests(concertBaseDir, options);
    
    console.log('');
    console.log('✨ Cleanup complete!');
    
    if (options.dryRun) {
        console.log('💡 Run without --dry to actually remove the files');
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = { main };