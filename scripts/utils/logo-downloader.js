#!/usr/bin/env node

/**
 * Logo Downloader Script for McCal Media Website
 * Automatically downloads logos from multiple sources with Flaticon fallbacks
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const LOGOS_DIR = path.join(__dirname, '..', 'assets', 'images', 'logos');
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

// Logo sources configuration with specific high-quality sources
const logoSources = {
  'new-york-post': {
    name: 'New York Post',
    sources: [
      // Direct SVG from Wikimedia Commons (your specified source)
      'https://upload.wikimedia.org/wikipedia/commons/4/40/New_York_Post.svg',
      // PNG version from Commons
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/New_York_Post.svg/200px-New_York_Post.svg.png',
      // Backup from Commons
      'https://commons.wikimedia.org/wiki/File:New_York_Post.svg'
    ],
    wikimediaFile: 'File:New_York_Post.svg',
    fallbackIcon: 'newspaper'
  },
  'point-park-university': {
    name: 'Point Park University',
    sources: [
      // Wikimedia Commons sources
      'https://upload.wikimedia.org/wikipedia/en/1/1a/Point_Park_University_seal.png',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Point_Park_University_seal.png/150px-Point_Park_University_seal.png',
      // Official website attempts
      'https://www.pointpark.edu/Portals/0/xBuild/images/header-logo.png',
      'https://www.pointpark.edu/portals/0/Images/logo-pointpark-university.png'
    ],
    wikimediaSearch: 'Point Park University',
    fallbackIcon: 'university'
  },
  'next-generation-news': {
    name: 'Next Generation News',
    sources: [
      // From your specified source
      'https://www.nextgenerationnewsroom.org/wp-content/uploads/2023/01/NGN-Logo-Horizontal-Color.png',
      'https://www.nextgenerationnewsroom.org/wp-content/themes/ngn/assets/images/logo.png'
    ],
    imgbinSearch: 'next generation news logo',
    fallbackIcon: 'news'
  },
  'pittsburgh-magazine': {
    name: 'Pittsburgh Magazine',
    sources: [
      // IMGBIN search for Pittsburgh Magazine
      'https://pittsburghmagazine.com/wp-content/uploads/2019/01/PGH-Magazine-Logo-Red.png'
    ],
    imgbinSearch: 'pittsburgh magazine logo',
    fallbackIcon: 'magazine'
  },
  'the-globe': {
    name: 'The Globe',
    sources: [
      // Point Park University's student newspaper
      'https://ppuglobe.com/wp-content/uploads/2023/09/Globe-Logo-2023.png',
      'https://ppuglobe.com/wp-content/themes/globe/assets/images/logo.png'
    ],
    imgbinSearch: 'globe newspaper logo',
    fallbackIcon: 'globe'
  },
  'nppa': {
    name: 'NPPA',
    sources: [
      // Check Wikimedia Commons for NPPA logos
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/NPPA_logo.svg/200px-NPPA_logo.svg.png',
      // National Press Photographers Association
      'https://nppa.org/sites/default/files/NPPA-logo-horizontal.png',
      'https://nppa.org/sites/all/themes/nppa/images/nppa-logo.png'
    ],
    wikimediaSearch: 'NPPA National Press Photographers Association',
    fallbackIcon: 'camera'
  },
  'pennsylvania-news-media': {
    name: 'Pennsylvania News Media',
    sources: [
      // Pennsylvania News Media Association
      'https://panewsmedia.org/wp-content/uploads/2020/01/PNMA-Logo.png'
    ],
    imgbinSearch: 'pennsylvania news media association logo',
    fallbackIcon: 'news'
  },
  'upward-consulting': {
    name: 'Upward Consulting',
    sources: [
      // Will need to search IMGBIN or use placeholder
    ],
    imgbinSearch: 'upward consulting logo business',
    fallbackIcon: 'consulting'
  }
};

// Helper function to extract actual image URLs from IMGBIN pages
function extractImgbinImageUrl(htmlContent) {
  // Look for PNG download links in IMGBIN HTML
  const pngMatches = htmlContent.match(/https:\/\/[^"']*\.png/gi);
  if (pngMatches && pngMatches.length > 0) {
    // Return the first high-quality PNG found
    return pngMatches.find(url => 
      url.includes('cdn') || 
      url.includes('static') || 
      url.includes('download')
    ) || pngMatches[0];
  }
  return null;
}

// Utility functions
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        console.log(`↳ Redirecting to: ${response.headers.location} - logo-downloader.js:135`);
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
      
      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
      
      file.on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function checkImageValidity(filepath) {
  return new Promise((resolve) => {
    fs.stat(filepath, (err, stats) => {
      if (err || stats.size < 100) { // Less than 100 bytes is likely invalid
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function createPlaceholderLogo(logoKey, name) {
  // Create minimal dark theme SVG placeholders
  const colors = {
    'new-york-post': '#1a1a1a',           // Dark charcoal
    'pittsburgh-magazine': '#2a2a2a',     // Darker gray
    'point-park-university': '#333333',   // Medium gray
    'the-globe': '#262626',              // Dark gray
    'nppa': '#1e1e1e',                   // Almost black
    'pennsylvania-news-media': '#303030', // Light charcoal
    'next-generation-news': '#242424',    // Dark slate
    'upward-consulting': '#2d2d2d'        // Medium charcoal
  };
  
  const color = colors[logoKey] || '#222222';
  const textColor = '#FFFFFF'; // Always white text for contrast
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="80" fill="${color}" rx="4"/>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="12" font-weight="bold" 
        text-anchor="middle" fill="${textColor}">${name}</text>
</svg>`;

  return svg;
}

async function downloadLogo(logoKey, config) {
  const { name, sources } = config;
  const filename = `${logoKey}-logo.png`;
  const filepath = path.join(LOGOS_DIR, filename);
  
  console.log(`\n🔍 Downloading logo for: ${name} - logo-downloader.js:208`);
  
  // Try each source URL
  for (let i = 0; i < sources.length; i++) {
    const url = sources[i];
    console.log(`Trying source ${i + 1}/${sources.length}: ${url.substring(0, 60)}... - logo-downloader.js:213`);
    
    try {
      await downloadFile(url, filepath);
      
      // Check if the downloaded file is valid
      const isValid = await checkImageValidity(filepath);
      if (isValid) {
        console.log(`✅ Successfully downloaded: ${filename} - logo-downloader.js:221`);
        return true;
      } else {
        console.log(`❌ Downloaded file is invalid, trying next source... - logo-downloader.js:224`);
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message} - logo-downloader.js:228`);
    }
  }
  
  // Create SVG placeholder as final fallback
  console.log(`📝 Creating SVG placeholder for ${name} - logo-downloader.js:233`);
  const svgPath = path.join(LOGOS_DIR, `${logoKey}-logo.svg`);
  const svg = createPlaceholderLogo(logoKey, name);
  fs.writeFileSync(svgPath, svg);
  console.log(`✅ Created placeholder: ${logoKey}logo.svg - logo-downloader.js:237`);
  
  return false;
}

async function main() {
  console.log('🚀 McCal Media Logo Downloader - logo-downloader.js:243');
  console.log('===============================\n - logo-downloader.js:244');
  
  // Ensure logos directory exists
  if (!fs.existsSync(LOGOS_DIR)) {
    fs.mkdirSync(LOGOS_DIR, { recursive: true });
    console.log(`📁 Created logos directory: ${LOGOS_DIR} - logo-downloader.js:249`);
  }
  
  const results = {
    success: 0,
    failed: 0,
    placeholder: 0
  };
  
  // Download all logos
  for (const [logoKey, config] of Object.entries(logoSources)) {
    try {
      const success = await downloadLogo(logoKey, config);
      if (success) {
        results.success++;
      } else {
        results.placeholder++;
      }
    } catch (error) {
      console.log(`❌ Error processing ${config.name}: ${error.message} - logo-downloader.js:268`);
      results.failed++;
    }
  }
  
  // Summary
  console.log('\n📊 Download Summary: - logo-downloader.js:274');
  console.log(`✅ Successfully downloaded: ${results.success} - logo-downloader.js:275`);
  console.log(`📝 SVG placeholders created: ${results.placeholder} - logo-downloader.js:276`);
  console.log(`❌ Failed: ${results.failed} - logo-downloader.js:277`);
  console.log(`📁 Files saved to: ${LOGOS_DIR} - logo-downloader.js:278`);
  
  // Update the about page to use local files instead of GitHub URLs
  console.log('\n🔄 Next steps: - logo-downloader.js:281');
  console.log('1. Run this script: node scripts/utils/ - logo-downloader.js:282');
  console.log('2. Check the downloaded logos in assets/images/logos/ - logo-downloader.js:283');
  console.log('3. Update the about page to use local file paths - logo-downloader.js:284');
  console.log('4. Push to GitHub for hosting - logo-downloader.js:285');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { downloadLogo, logoSources };