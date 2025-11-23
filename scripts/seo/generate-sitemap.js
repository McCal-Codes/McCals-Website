#!/usr/bin/env node

/**
 * Generate XML Sitemap from Portfolio API
 * 
 * Fetches all portfolio manifests and creates a comprehensive sitemap
 * with proper lastmod dates and image entries for SEO.
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const SITE_URL = process.env.SITE_URL || 'https://mccalmedia.com';
const OUTPUT_PATH = path.join(__dirname, '../../dist/sitemap.xml');

// Portfolio types to include
const PORTFOLIOS = ['concert', 'events', 'journalism', 'portrait', 'nature'];

// Helper: Slugify text for URLs
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper: Build image URL
function buildImageUrl(folderPath, filename) {
  const cleanPath = folderPath.replace(/^\/+|\/+$/g, '');
  return `${SITE_URL}/images/Portfolios/${cleanPath}/${encodeURIComponent(filename)}`;
}

// Helper: Generate XML
function generateSitemapXML(urls) {
  const urlEntries = urls.map(entry => {
    let xml = `  <url>\n`;
    xml += `    <loc>${entry.loc}</loc>\n`;
    xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    xml += `    <priority>${entry.priority}</priority>\n`;
    
    // Add image entries if present
    if (entry.images && entry.images.length > 0) {
      entry.images.forEach(img => {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${img.loc}</image:loc>\n`;
        if (img.title) xml += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        if (img.caption) xml += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        xml += `    </image:image>\n`;
      });
    }
    
    xml += `  </url>\n`;
    return xml;
  }).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urlEntries}</urlset>`;
}

// Helper: Escape XML special characters
function escapeXml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Main function
async function generateSitemap() {
  console.log('🗺️  Generating sitemap from API...\n');
  
  const urls = [];
  let totalImages = 0;
  
  // Static pages
  urls.push({
    loc: SITE_URL,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 1.0
  });
  
  urls.push({
    loc: `${SITE_URL}/about`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: 0.8
  });
  
  // Portfolio pages
  for (const type of PORTFOLIOS) {
    try {
      console.log(`Fetching ${type} manifest...`);
      const response = await fetch(`${API_BASE}/api/v1/manifests/${type}`);
      
      if (!response.ok) {
        console.warn(`  ⚠️  ${type}: HTTP ${response.status} - skipping`);
        continue;
      }
      
      const { data } = await response.json();
      
      // Portfolio overview page
      urls.push({
        loc: `${SITE_URL}/${type}`,
        lastmod: data.generated || new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: 0.9
      });
      
      // Individual items
      const items = data.bands || data.events || data.albums || data.collections || [];
      let itemCount = 0;
      
      items.forEach(item => {
        const name = item.bandName || item.title || item.name;
        if (!name) return;
        
        const images = (item.images || []).slice(0, 5).map(img => ({
          loc: buildImageUrl(item.folderPath || item.path || type, img),
          title: `${name} - ${item.dateDisplay || item.date || ''}`,
          caption: item.venue || item.description || ''
        }));
        
        urls.push({
          loc: `${SITE_URL}/${type}/${slugify(name)}`,
          lastmod: item.concertDate?.iso || item.date || data.generated,
          changefreq: 'monthly',
          priority: 0.7,
          images
        });
        
        itemCount++;
        totalImages += images.length;
      });
      
      console.log(`  ✓ ${type}: ${itemCount} items, ${itemCount * 5} images (max)`);
      
    } catch (err) {
      console.error(`  ✗ ${type}: ${err.message}`);
    }
  }
  
  // Generate XML
  const xml = generateSitemapXML(urls);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write sitemap
  fs.writeFileSync(OUTPUT_PATH, xml);
  
  console.log('\n✅ Sitemap generated successfully!');
  console.log(`   📄 File: ${OUTPUT_PATH}`);
  console.log(`   🔗 URLs: ${urls.length}`);
  console.log(`   📸 Images: ${totalImages}`);
  console.log(`\n💡 Submit to search engines:`);
  console.log(`   Google: https://www.google.com/ping?sitemap=${encodeURIComponent(SITE_URL + '/sitemap.xml')}`);
  console.log(`   Bing: Use Webmaster Tools to submit\n`);
}

// Run
if (require.main === module) {
  generateSitemap().catch(err => {
    console.error('❌ Sitemap generation failed:', err.message);
    process.exit(1);
  });
}

module.exports = { generateSitemap };
