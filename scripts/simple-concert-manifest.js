#!/usr/bin/env node
/**
 * Simple Concert Manifest Generator
 * 
 * Generates a clean, simple manifest for the concert widget
 * Author: McCal-Codes
 * Version: 4.0
 */

const fs = require('fs');
const path = require('path');

const CONCERT_BASE = path.join(__dirname, '../images/Portfolios/Concert');
const OUTPUT_FILE = path.join(CONCERT_BASE, 'concert-manifest.json');

function log(message) {
  console.log(`🎸 ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

// Simple date extraction from folder names
function extractDate(folderName) {
  // Pattern: "Month YYYY" (e.g., "August 2025")
  const monthYear = folderName.match(/^(\w+)\s+(\d{4})$/i);
  if (monthYear) {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                   'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = months.indexOf(monthYear[1].toLowerCase());
    if (monthIndex !== -1) {
      return {
        year: parseInt(monthYear[2]),
        month: monthIndex + 1,
        monthName: monthYear[1],
        day: 1,
        iso: `${monthYear[2]}-${String(monthIndex + 1).padStart(2, '0')}-01`
      };
    }
  }
  
  // Fallback to current year
  const currentYear = new Date().getFullYear();
  return {
    year: currentYear,
    month: 1,
    monthName: 'January',
    day: 1,
    iso: `${currentYear}-01-01`
  };
}

function generateManifest() {
  log('Generating simple concert manifest...');
  
  try {
    if (!fs.existsSync(CONCERT_BASE)) {
      error(`Concert directory not found: ${CONCERT_BASE}`);
      return;
    }
    
    const bands = [];
    const bandFolders = fs.readdirSync(CONCERT_BASE)
      .filter(item => {
        const fullPath = path.join(CONCERT_BASE, item);
        return fs.statSync(fullPath).isDirectory() && !item.startsWith('.');
      });
    
    log(`Found ${bandFolders.length} band folders`);
    
    for (const bandName of bandFolders) {
      const bandPath = path.join(CONCERT_BASE, bandName);
      
      // Look for date subfolders
      const subfolders = fs.readdirSync(bandPath)
        .filter(item => {
          const fullPath = path.join(bandPath, item);
          return fs.statSync(fullPath).isDirectory();
        });
      
      // Use the first subfolder we find
      for (const subfolder of subfolders) {
        const subPath = path.join(bandPath, subfolder);
        
        // Get images from this folder
        const images = fs.readdirSync(subPath)
          .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
          .sort();
        
        if (images.length === 0) continue;
        
        const concertDate = extractDate(subfolder);
        
        bands.push({
          bandName: bandName,
          folderPath: `${bandName}/${subfolder}`,
          dateDisplay: subfolder,
          concertDate: concertDate,
          totalImages: images.length,
          images: images
        });
        
        log(`Added ${bandName} (${subfolder}) - ${images.length} images`);
        break; // Only process first valid subfolder
      }
    }
    
    // Sort by date (newest first)
    bands.sort((a, b) => new Date(b.concertDate.iso) - new Date(a.concertDate.iso));
    
    const manifest = {
      version: "1.0",
      generated: new Date().toISOString(),
      totalBands: bands.length,
      bands: bands
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    success(`Generated manifest with ${bands.length} bands`);
    success(`Output: ${OUTPUT_FILE}`);
    
    // Show summary
    console.log('\n📋 Bands included:');
    bands.forEach(band => {
      console.log(`   • ${band.bandName} (${band.dateDisplay}) - ${band.totalImages} images`);
    });
    
  } catch (err) {
    error(`Failed to generate manifest: ${err.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateManifest();
}

module.exports = { generateManifest };