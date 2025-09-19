#!/usr/bin/env node
/**
 * Auto Concert Organizer - Organize concert images by reading filename dates
 * 
 * This script reads date patterns from filenames and automatically creates
 * organized folder structures like "August 2025", "December 2024"
 * 
 * Features:
 * - Reads YYMMDD and YYYYMMDD patterns from filenames
 * - Creates human-readable folders (e.g., "August 2025")
 * - Moves images to appropriate folders
 * - Handles multiple concerts per band
 * - Generates enhanced manifests
 * 
 * Usage:
 *   node scripts/auto-concert-organizer.js <band-directory>
 *   node scripts/auto-concert-organizer.js --auto (processes all bands)
 * 
 * Author: McCal-Codes
 * Version: 1.0
 */

const fs = require('fs');
const path = require('path');

// Configuration
const CONCERT_BASE_DIR = path.resolve(__dirname, '../images/Portfolios/Concert');
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

// Import from our enhanced manifest generator
const { extractDateFromFilename } = require('./enhanced-manifest-generator');

/**
 * Get month name from number
 */
function getMonthName(month) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || 'Unknown';
}

/**
 * Get human-readable folder name from date
 */
function getDateFolderName(year, month) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[month - 1]} ${year}`;
}

/**
 * Analyze images in a directory and group by date
 */
function analyzeImages(dirPath) {
    console.log(`\n📁 Analyzing: ${path.basename(dirPath)}`);
    
    if (!fs.existsSync(dirPath)) {
        console.error(`❌ Directory not found: ${dirPath}`);
        return null;
    }
    
    const files = fs.readdirSync(dirPath)
        .filter(file => {
            const fullPath = path.join(dirPath, file);
            return fs.statSync(fullPath).isFile() && IMAGE_EXTENSIONS.test(file);
        });
    
    console.log(`📸 Found ${files.length} image files`);
    
    if (files.length === 0) {
        console.warn(`⚠️  No images to organize`);
        return null;
    }
    
    // Group files by date
    const dateGroups = {};
    const unrecognizedFiles = [];
    
    for (const filename of files) {
        const dateInfo = extractDateFromFilename(filename);
        
        if (dateInfo) {
            const folderName = getDateFolderName(dateInfo.year, dateInfo.month);
            
            if (!dateGroups[folderName]) {
                dateGroups[folderName] = {
                    year: dateInfo.year,
                    month: dateInfo.month,
                    monthName: getMonthName(dateInfo.month),
                    files: [],
                    dateSource: dateInfo.source
                };
            }
            
            dateGroups[folderName].files.push(filename);
            console.log(`📅 ${filename} → ${folderName} (${dateInfo.source})`);
        } else {
            unrecognizedFiles.push(filename);
            console.log(`❓ ${filename} → No date pattern recognized`);
        }
    }
    
    return {
        dateGroups,
        unrecognizedFiles,
        totalFiles: files.length
    };
}

/**
 * Organize images into date-based folders
 */
function organizeImages(bandPath, analysis, options = {}) {
    const { dryRun = false } = options;
    const bandName = path.basename(bandPath);
    
    console.log(`\n🗂️  Organizing ${bandName}...`);
    
    if (Object.keys(analysis.dateGroups).length === 0) {
        console.log(`ℹ️  No date-based organization needed for ${bandName}`);
        return;
    }
    
    // Create date folders and move files
    for (const [folderName, group] of Object.entries(analysis.dateGroups)) {
        const targetDir = path.join(bandPath, folderName);
        
        console.log(`\n📁 Creating folder: ${folderName}`);
        console.log(`   📊 ${group.files.length} files to move`);
        
        if (!dryRun) {
            // Create target directory
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
                console.log(`✅ Created: ${targetDir}`);
            }
            
            // Move files
            for (const filename of group.files) {
                const sourcePath = path.join(bandPath, filename);
                const targetPath = path.join(targetDir, filename);
                
                try {
                    fs.renameSync(sourcePath, targetPath);
                    console.log(`   📦 Moved: ${filename}`);
                } catch (error) {
                    console.error(`   ❌ Failed to move ${filename}: ${error.message}`);
                }
            }
        } else {
            console.log(`🏃 DRY RUN - Would create: ${targetDir}`);
            group.files.forEach(file => console.log(`   📦 Would move: ${file}`));
        }
    }
    
    // Handle unrecognized files
    if (analysis.unrecognizedFiles.length > 0) {
        console.log(`\n❓ Unrecognized files (${analysis.unrecognizedFiles.length}):`);
        analysis.unrecognizedFiles.forEach(file => console.log(`   • ${file}`));
        console.log(`   ℹ️  These files will stay in the root band directory`);
    }
}

/**
 * Process a single band directory
 */
async function processBandDirectory(bandPath, options = {}) {
    const bandName = path.basename(bandPath);
    console.log(`\n🎵 Processing band: ${bandName}`);
    
    // Skip if this directory already has organized subdirectories
    const entries = fs.readdirSync(bandPath);
    const subDirs = entries.filter(entry => {
        const fullPath = path.join(bandPath, entry);
        return fs.statSync(fullPath).isDirectory();
    });
    
    if (subDirs.length > 0) {
        console.log(`ℹ️  ${bandName} already has subdirectories: ${subDirs.join(', ')}`);
        console.log(`   Skipping organization (already organized)`);
        return;
    }
    
    // Analyze current images
    const analysis = analyzeImages(bandPath);
    if (!analysis) return;
    
    // Show summary
    console.log(`\n📊 Analysis Summary for ${bandName}:`);
    console.log(`   📸 Total files: ${analysis.totalFiles}`);
    console.log(`   📅 Date groups: ${Object.keys(analysis.dateGroups).length}`);
    console.log(`   ❓ Unrecognized: ${analysis.unrecognizedFiles.length}`);
    
    if (Object.keys(analysis.dateGroups).length > 0) {
        console.log(`   📁 Will create folders:`);
        Object.keys(analysis.dateGroups).forEach(folder => {
            const group = analysis.dateGroups[folder];
            console.log(`      • ${folder} (${group.files.length} files)`);
        });
    }
    
    // Organize the images
    organizeImages(bandPath, analysis, options);
}

/**
 * Process all band directories
 */
async function processAllBands(options = {}) {
    console.log(`🔍 Auto-organizing all bands in: ${CONCERT_BASE_DIR}`);
    
    if (!fs.existsSync(CONCERT_BASE_DIR)) {
        console.error(`❌ Concert base directory not found: ${CONCERT_BASE_DIR}`);
        return;
    }
    
    const entries = fs.readdirSync(CONCERT_BASE_DIR);
    const bandDirs = entries
        .map(entry => path.join(CONCERT_BASE_DIR, entry))
        .filter(fullPath => fs.statSync(fullPath).isDirectory());
    
    console.log(`📁 Found ${bandDirs.length} band directories`);
    
    for (const bandPath of bandDirs) {
        await processBandDirectory(bandPath, options);
    }
    
    console.log(`\n✨ Organization complete!`);
    console.log(`📋 Processed ${bandDirs.length} band directories`);
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Auto Concert Organizer

Usage:
  node auto-concert-organizer.js <band-directory>     Organize specific band
  node auto-concert-organizer.js --auto               Organize all bands
  node auto-concert-organizer.js --auto --dry         Dry run (preview only)
  
Options:
  --dry        Dry run mode (don't move files)
  --verbose    Show detailed information  
  --help       Show this help

Examples:
  # Organize a specific band
  node auto-concert-organizer.js "/path/to/Concert/The Book Club"
  
  # Preview organization for all bands
  node auto-concert-organizer.js --auto --dry
  
  # Organize all bands
  node auto-concert-organizer.js --auto

Features:
- Reads YYMMDD and YYYYMMDD date patterns from filenames
- Creates human-readable folders (e.g., "August 2025", "December 2024")
- Moves images to appropriate date folders
- Preserves unrecognized files in band root directory
- Dry run mode for safe previewing
        `);
        return;
    }
    
    const options = {
        dryRun: args.includes('--dry'),
        verbose: args.includes('--verbose')
    };
    
    if (args.includes('--auto')) {
        await processAllBands(options);
    } else if (args.length > 0 && !args[0].startsWith('--')) {
        const bandPath = path.resolve(args[0]);
        await processBandDirectory(bandPath, options);
    } else {
        console.error('❌ Please specify a band directory or use --auto');
        console.log('Use --help for usage information');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    analyzeImages,
    organizeImages,
    processBandDirectory,
    processAllBands,
    getDateFolderName
};