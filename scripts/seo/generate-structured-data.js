#!/usr/bin/env node

/**
 * Generate Structured Data (JSON-LD) from Portfolio API
 * 
 * Creates Schema.org structured data for each portfolio type
 * to improve search engine visibility and rich results.
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const SITE_URL = process.env.SITE_URL || 'https://mccalmedia.com';
const OUTPUT_DIR = path.join(__dirname, '../../dist/structured-data');

const PORTFOLIOS = ['concert', 'events', 'journalism', 'portrait'];

// Helper: Build image URL
function buildImageUrl(folderPath, filename) {
  const cleanPath = folderPath.replace(/^\/+|\/+$/g, '');
  return `${SITE_URL}/images/Portfolios/${cleanPath}/${encodeURIComponent(filename)}`;
}

// Helper: Capitalize
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Generate schema for a portfolio type
async function generateSchema(type) {
  try {
    console.log(`Generating schema for ${type}...`);
    
    const response = await fetch(`${API_BASE}/api/v1/manifests/${type}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const { data } = await response.json();
    
    // Get items
    const items = data.bands || data.events || data.albums || data.collections || [];
    const totalImages = items.reduce((sum, item) => sum + (item.totalImages || item.images?.length || 0), 0);
    
    // Sample images for schema
    const sampleImages = items
      .slice(0, 10)
      .flatMap(item => {
        const imgs = (item.images || []).slice(0, 3);
        return imgs.map(img => buildImageUrl(item.folderPath || item.path || type, img));
      })
      .slice(0, 20);
    
    // Build schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": `${capitalize(type)} Photography Portfolio`,
      "description": `Professional ${type} photography by Caleb McCartney featuring ${items.length} ${type === 'concert' ? 'bands' : 'collections'} and ${totalImages} images`,
      "url": `${SITE_URL}/${type}`,
      "image": sampleImages,
      "author": {
        "@type": "Person",
        "name": "Caleb McCartney",
        "jobTitle": "Photographer & Photojournalist",
        "url": SITE_URL,
        "sameAs": [
          "https://github.com/McCal-Codes",
          // Add social media profiles here
        ]
      },
      "datePublished": data.generated ? new Date(data.generated).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      "numberOfItems": totalImages,
      "genre": `${capitalize(type)} Photography`,
      "inLanguage": "en-US",
      "copyrightHolder": {
        "@type": "Person",
        "name": "Caleb McCartney"
      },
      "copyrightYear": new Date().getFullYear(),
      "license": `${SITE_URL}/policies#license`
    };
    
    // Add individual image objects for first 10 items
    if (items.length > 0) {
      schema.associatedMedia = items.slice(0, 10).flatMap(item => {
        const name = item.bandName || item.title || item.name;
        return (item.images || []).slice(0, 3).map(img => ({
          "@type": "ImageObject",
          "contentUrl": buildImageUrl(item.folderPath || item.path || type, img),
          "name": `${name} - ${item.dateDisplay || ''}`,
          "description": item.venue || item.description || `${type} photography`,
          "copyrightHolder": {
            "@type": "Person",
            "name": "Caleb McCartney"
          },
          "datePublished": item.concertDate?.iso || item.date || data.generated
        }));
      });
    }
    
    console.log(`  ✓ Generated schema with ${sampleImages.length} images`);
    return schema;
    
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
    return null;
  }
}

// Main function
async function generateAllSchemas() {
  console.log('📊 Generating structured data from API...\n');
  
  const schemas = {};
  
  for (const type of PORTFOLIOS) {
    const schema = await generateSchema(type);
    if (schema) {
      schemas[type] = schema;
    }
  }
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Write individual schema files
  for (const [type, schema] of Object.entries(schemas)) {
    const outputPath = path.join(OUTPUT_DIR, `${type}-schema.json`);
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    console.log(`✓ Wrote ${type} schema: ${outputPath}`);
  }
  
  // Write combined schema file
  const combinedPath = path.join(OUTPUT_DIR, 'all-schemas.json');
  fs.writeFileSync(combinedPath, JSON.stringify(schemas, null, 2));
  
  console.log(`\n✅ Structured data generated!`);
  console.log(`   📁 Directory: ${OUTPUT_DIR}`);
  console.log(`   📄 Files: ${Object.keys(schemas).length + 1}`);
  console.log(`\n💡 Test your schemas:`);
  console.log(`   https://search.google.com/test/rich-results\n`);
}

// Run
if (require.main === module) {
  generateAllSchemas().catch(err => {
    console.error('❌ Schema generation failed:', err.message);
    process.exit(1);
  });
}

module.exports = { generateAllSchemas, generateSchema };
