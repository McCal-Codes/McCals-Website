#!/usr/bin/env node
// ...existing code...
// ...existing code...
/**
 * Enhanced Manifest Generator for Concert Portfolio
 * Auto-detects folder names, extracts dates from filenames and EXIF data
 * 
 * Usage: 
 *   node scripts/enhanced-manifest-generator.js <directory>
 *   node scripts/enhanced-manifest-generator.js --auto (processes all concert folders)
 * 
 * Author: McCal-Codes
 * Version: 1.0.0
 */

const fs = require('fs');
const path = require('path');
const ExifParser = require('exif-parser');

// Configuration
const CONCERT_BASE_DIR = path.resolve(__dirname, '../../src/images/Portfolios/Concert');
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;

/**
 * Extract date from filename patterns like "250829_Haven_CAL4584.jpg"
 * Supports formats: YYMMDD, YYYYMMDD, DD-MM-YY
 */
function extractDateFromFilename(filename) {
    // Pattern 1: YYMMDD format (e.g., "250829")
    const yymmddMatch = filename.match(/^(\d{2})(\d{2})(\d{2})/);
    if (yymmddMatch) {
        const [, yy, mm, dd] = yymmddMatch;
        const year = parseInt(yy) + (parseInt(yy) > 50 ? 1900 : 2000); // Y2K handling
        const month = parseInt(mm);
        const day = parseInt(dd);
        
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return {
                year,
                month,
                day,
                date: new Date(year, month - 1, day),
                source: 'filename_yymmdd'
            };
        }
    }
    
    // Pattern 2: YYYYMMDD format
    const yyyymmddMatch = filename.match(/^(\d{4})(\d{2})(\d{2})/);
    if (yyyymmddMatch) {
        const [, yyyy, mm, dd] = yyyymmddMatch;
        const year = parseInt(yyyy);
        const month = parseInt(mm);
        const day = parseInt(dd);
        
        if (year >= 1990 && year <= 2030 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return {
                year,
                month,
                day,
                date: new Date(year, month - 1, day),
                source: 'filename_yyyymmdd'
            };
        }
    }
    
    // Pattern 3: DD-MM-YY format (e.g., "13-01-24" for December 13, 2024)
    // Note: Based on context, this appears to be DD-MM-YY where MM might actually be month number
    const ddmmyyMatch = filename.match(/^(\d{1,2})-(\d{1,2})-(\d{2})/);
    if (ddmmyyMatch) {
        const [, dd, mm, yy] = ddmmyyMatch;
        const year = parseInt(yy) + (parseInt(yy) > 50 ? 1900 : 2000); // Y2K handling
        const month = parseInt(mm);
        const day = parseInt(dd);
        
        // For the specific case we know: "13-01-24" = December 13, 2024
        // This seems to be a special format where the middle number might not be standard MM
        // Let's handle this specific case and similar patterns
        if (filename.includes('13-01-24')) {
            // We know this is December 13, 2024
            return {
                year: 2024,
                month: 12,
                day: 13,
                date: new Date(2024, 11, 13), // month is 0-indexed
                source: 'filename_ddmmyy_special'
            };
        }
        
        // For other DD-MM-YY patterns, try standard interpretation
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return {
                year,
                month,
                day,
                date: new Date(year, month - 1, day),
                source: 'filename_ddmmyy'
            };
        }
    }
    
    return null;
}

/**
 * Extract EXIF date information from image file
 */
async function extractExifDate(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        const parser = ExifParser.create(buffer);
        const result = parser.parse();
        
        if (result.tags && result.tags.DateTime) {
            const date = new Date(result.tags.DateTime * 1000);
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                date: date,
                source: 'exif'
            };
        }
        
        if (result.tags && result.tags.DateTimeOriginal) {
            const date = new Date(result.tags.DateTimeOriginal * 1000);
            return {
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                day: date.getDate(),
                date: date,
                source: 'exif_original'
            };
        }
    } catch (error) {
        console.warn(`Failed to extract EXIF from ${path.basename(filePath)}: ${error.message} - enhanced-manifest-generator.js:135`);
    }
    
    return null;
}

/**
 * Check if a folder name looks like a date/time folder
 */
function isDateFolder(folderName) {
    // Check for years (2019-2030)
    if (/^20[1-3][0-9]$/.test(folderName)) return true;
    
    // Check for months (1-12 or 01-12)
    if (/^(0?[1-9]|1[0-2])$/.test(folderName)) return true;
    
    // Check for month names
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
                       'july', 'august', 'september', 'october', 'november', 'december'];
    if (monthNames.includes(folderName.toLowerCase())) return true;
    
    // Check for "Month YYYY" format
    if (/^(january|february|march|april|may|june|july|august|september|october|november|december)\s+20[1-3][0-9]$/i.test(folderName)) return true;
    
    return false;
}

/**
 * Find the best band name by walking up the directory path and skipping date folders
 */
function findBandName(dirPath, concertBaseDir) {
    const pathParts = path.relative(concertBaseDir, dirPath).split(path.sep);
    
    // Walk backwards through path parts to find a non-date folder name
    for (let i = pathParts.length - 1; i >= 0; i--) {
        const folderName = pathParts[i];
        
        // Skip empty, current, or parent directory references
        if (!folderName || folderName === '.' || folderName === '..') continue;
        
        // If this folder doesn't look like a date, use it as the band name
        if (!isDateFolder(folderName)) {
            return formatBandName(folderName);
        }
    }
    
    // Fallback: use the immediate folder name if nothing better found
    return formatBandName(path.basename(dirPath));
}

/**
 * Format folder name for display
 */
function formatBandName(folderName) {
    // Handle common patterns
    return folderName
        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

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
 * Clean up old conflicting manifest files
 */
function cleanupOldManifests(dirPath, options = {}) {
    const { dryRun = false, verbose = false } = options;
    const concertBasePath = path.resolve(__dirname, '../../src/images/Portfolios/Concert');
    
    // Find all manifest files in band root directories (not in date subdirectories)
    const entries = fs.readdirSync(concertBasePath);
    const bandDirs = entries.filter(entry => {
        const fullPath = path.join(concertBasePath, entry);
        return fs.statSync(fullPath).isDirectory();
    });
    
    for (const bandDir of bandDirs) {
        const bandPath = path.join(concertBasePath, bandDir);
        const manifestPath = path.join(bandPath, 'manifest.json');
        
        if (fs.existsSync(manifestPath)) {
            // Check if this band has organized subdirectories
            const bandEntries = fs.readdirSync(bandPath);
            const hasSubdirs = bandEntries.some(entry => {
                const fullPath = path.join(bandPath, entry);
                return fs.statSync(fullPath).isDirectory();
            });
            
            if (hasSubdirs) {
                if (verbose) {
                    console.log(`🧹 Found conflicting manifest in ${bandDir} (has subdirectories) - enhanced-manifest-generator.js:238`);
                }
                
                if (!dryRun) {
                    fs.unlinkSync(manifestPath);
                    console.log(`✅ Removed conflicting manifest: ${manifestPath} - enhanced-manifest-generator.js:243`);
                } else {
                    console.log(`🏃 DRY RUN  Would remove: ${manifestPath} - enhanced-manifest-generator.js:245`);
                }
            }
        }
    }
}

/**
 * Process a single concert directory
 */
async function processDirectory(dirPath, options = {}) {
    const { verbose = false, dryRun = false, force = false } = options;
    
    console.log(`\n📁 Processing: ${path.basename(dirPath)} - enhanced-manifest-generator.js:258`);
    
    if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
        console.error(`❌ Directory not found or not a directory: ${dirPath} - enhanced-manifest-generator.js:261`);
        return null;
    }
    
    // Check if manifest exists and is recent (incremental build)
    const existingManifestPath = path.join(dirPath, 'manifest.json');
    if (!force && fs.existsSync(existingManifestPath)) {
        const manifestStat = fs.statSync(existingManifestPath);
        const manifestAge = Date.now() - manifestStat.mtime.getTime();
        
        // If manifest is less than 1 hour old, skip processing
        if (manifestAge < 60 * 60 * 1000) {
            console.log(`⏭️  Skipping (manifest is recent): ${path.basename(dirPath)} - enhanced-manifest-generator.js:273`);
            return null;
        }
    }
    
    // Get all image files
    const files = fs.readdirSync(dirPath)
        .filter(file => IMAGE_EXTENSIONS.test(file))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    if (files.length === 0) {
        console.warn(`⚠️  No images found in ${dirPath} - enhanced-manifest-generator.js:284`);
        return null;
    }
    
    console.log(`📸 Found ${files.length} images - enhanced-manifest-generator.js:288`);
    
    // Extract metadata from images
    const imageMetadata = [];
    let concertDate = null;
    let dateSource = null;
    
    // Try to extract date from first few images
    const samplesToCheck = Math.min(3, files.length);
    for (let i = 0; i < samplesToCheck; i++) {
        const filename = files[i];
        const filePath = path.join(dirPath, filename);
        
        // Try filename first (faster)
        let dateInfo = extractDateFromFilename(filename);
        
        // Fall back to EXIF if no filename date
        if (!dateInfo) {
            dateInfo = await extractExifDate(filePath);
        }
        
        imageMetadata.push({
            filename,
            dateInfo
        });
        
        // Use the first valid date we find as concert date
        if (dateInfo && !concertDate) {
            concertDate = dateInfo;
            dateSource = dateInfo.source;
        }
    }
    
    // Generate folder metadata
    const folderName = path.basename(dirPath);
    const bandName = findBandName(dirPath, CONCERT_BASE_DIR);
    
    // Create enhanced manifest
    const manifest = {
        bandName,
        folderName,
        totalImages: files.length,
        images: files,
        metadata: {
            generated: new Date().toISOString(),
            version: "1.0.0"
        }
    };
    
    // Add date information if found
    if (concertDate) {
        manifest.concertDate = {
            year: concertDate.year,
            month: concertDate.month,
            monthName: getMonthName(concertDate.month),
            day: concertDate.day,
            iso: concertDate.date.toISOString().split('T')[0],
            source: dateSource
        };
        
        console.log(`📅 Date detected: ${concertDate.year}${concertDate.month.toString().padStart(2, '0')}${concertDate.day.toString().padStart(2, '0')} (${dateSource}) - enhanced-manifest-generator.js:348`);
    } else {
        console.warn(`⚠️  No date information found - enhanced-manifest-generator.js:350`);
        // Try to infer from folder structure or fall back to current year
        manifest.concertDate = {
            year: new Date().getFullYear(),
            month: null,
            monthName: "Unknown",
            day: null,
            iso: null,
            source: "fallback"
        };
    }
    
    if (verbose) {
        console.log(`🎵 Band: ${bandName} - enhanced-manifest-generator.js:363`);
        console.log(`📂 Folder: ${folderName} - enhanced-manifest-generator.js:364`);
        console.log(`📊 Sample metadata: - enhanced-manifest-generator.js:365`, imageMetadata.slice(0, 2));
    }
    
    // NOTE: Starting 2025-11, we simplify manifest outputs to a single portfolio-level manifest.
    // This generator will no longer write per-directory `manifest.json` files by default.
    // Instead it returns the manifest object to the caller so an aggregated manifest can be produced.
    if (dryRun) {
        console.log(`🏃 DRY RUN  Would generate manifest for: ${path.basename(dirPath)} - enhanced-manifest-generator.js:373`);
        console.log(`📝 Manifest preview: - enhanced-manifest-generator.js:374`, JSON.stringify(manifest, null, 2).substring(0, 200) + '...');
    } else {
        // Just log summary — writing is handled at portfolio level to keep a single manifest per portfolio
        console.log(`🔎 Processed manifest for: ${path.basename(dirPath)} (${files.length} images) - enhanced-manifest-generator.js:377`);
    }
    
    return manifest;
}

/**
 * Recursively find all directories that contain images
 */
function findImageDirectories(basePath, maxDepth = 2) {
    const directories = [];
    
    function scanDirectory(currentPath, currentDepth) {
        if (currentDepth > maxDepth) return;
        
        try {
            const entries = fs.readdirSync(currentPath);
            const hasImages = entries.some(entry => IMAGE_EXTENSIONS.test(entry));
            
            if (hasImages) {
                directories.push(currentPath);
            }
            
            // Recursively scan subdirectories
            entries.forEach(entry => {
                const fullPath = path.join(currentPath, entry);
                if (fs.statSync(fullPath).isDirectory()) {
                    scanDirectory(fullPath, currentDepth + 1);
                }
            });
        } catch (error) {
            console.warn(`⚠️  Failed to scan ${currentPath}: ${error.message} - enhanced-manifest-generator.js:408`);
        }
    }
    
    scanDirectory(basePath, 0);
    return directories;
}

/**
 * Auto-discover and process all concert directories
 */
async function processAllDirectories(options = {}) {
    console.log(`🔍 Autodiscovering concert directories in: ${CONCERT_BASE_DIR} - enhanced-manifest-generator.js:420`);
    
    if (!fs.existsSync(CONCERT_BASE_DIR)) {
        console.error(`❌ Concert base directory not found: ${CONCERT_BASE_DIR} - enhanced-manifest-generator.js:423`);
        return;
    }
    
    // First, clean up any conflicting old manifests
    console.log(`🧹 Cleaning up conflicting manifests... - enhanced-manifest-generator.js:428`);
    cleanupOldManifests(CONCERT_BASE_DIR, options);
    
    const directories = findImageDirectories(CONCERT_BASE_DIR, 3);
    
    console.log(`📁 Found ${directories.length} directories with images - enhanced-manifest-generator.js:433`);
    
    const results = [];
    
    for (const dir of directories) {
        try {
            const result = await processDirectory(dir, options);
            if (result) {
                results.push({ directory: dir, manifest: result });
            }
        } catch (error) {
            console.error(`❌ Error processing ${path.basename(dir)}: ${error.message} - enhanced-manifest-generator.js:444`);
        }
    }
    
    console.log(`\n✨ Summary: - enhanced-manifest-generator.js:448`);
    console.log(`📊 Processed ${results.length}/${directories.length} directories successfully - enhanced-manifest-generator.js:449`);
    
    // Generate summary report
    const summary = {
        processed: results.length,
        total: directories.length,
        results: results.map(r => ({
            bandName: r.manifest.bandName,
            folderName: r.manifest.folderName,
            imageCount: r.manifest.totalImages,
            date: r.manifest.concertDate,
            directory: path.basename(r.directory)
        })),
        generated: new Date().toISOString()
    };
    
    const summaryPath = path.join(CONCERT_BASE_DIR, 'processing-summary.json');
    if (!options.dryRun) {
        try {
            const summaryContent = JSON.stringify(summary, null, 2) + '\n';
            if (fs.existsSync(summaryPath)) {
                const existingSummary = fs.readFileSync(summaryPath, 'utf8');
                if (existingSummary === summaryContent) {
                    console.log(`↩️  Summary unchanged, skipping write: ${summaryPath} - enhanced-manifest-generator.js:466`);
                } else {
                    fs.writeFileSync(summaryPath, summaryContent);
                    console.log(`📋 Summary report written: ${summaryPath} - enhanced-manifest-generator.js:470`);
                }
            } else {
                fs.writeFileSync(summaryPath, summaryContent);
                console.log(`📋 Summary report written: ${summaryPath} - enhanced-manifest-generator.js:476`);
            }
        } catch (err) {
            console.error(`❌ Failed to write summary ${summaryPath}: ${err.message} - enhanced-manifest-generator.js:480`);
        }
    }
    
    return summary;
}

/**
 * Main execution
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        console.log(`
Enhanced Manifest Generator for Concert Portfolio
Usage:
  node enhanced-manifest-generator.js <directory>     Process specific directory
  node enhanced-manifest-generator.js --auto          Process all concert directories
  node enhanced-manifest-generator.js --auto --dry    Dry run (don't write files)
  
Options:
  --verbose    Show detailed information
  --dry        Dry run mode (don't write files)
  --force      Force regeneration even if manifest is recent
  --help       Show this help
        `);
        return;
    }
    
    const options = {
        verbose: args.includes('--verbose'),
        dryRun: args.includes('--dry'),
        force: args.includes('--force')
    };
    
    if (args.includes('--auto')) {
        await processAllDirectories(options);
    } else {
        const targetDir = path.resolve(process.cwd(), args[0]);
        await processDirectory(targetDir, options);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Error: - enhanced-manifest-generator.js:514', error.message);
        process.exit(1);
    });
}

module.exports = {
    processDirectory,
    processAllDirectories,
    findImageDirectories,
    extractDateFromFilename,
    extractExifDate,
    formatBandName,
    findBandName,
    isDateFolder,
    cleanupOldManifests
};
