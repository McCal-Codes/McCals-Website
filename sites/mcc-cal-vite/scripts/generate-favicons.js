/**
 * Favicon Generator Script
 * Generates favicon files with dark background (#0a0a0a) and white logo
 * 
 * Usage: node scripts/generate-favicons.js
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source logo file (use your mc-logo-light.png since it has white logo)
const SOURCE_LOGO = path.join(__dirname, '..', '..', '..', 'src', 'images', '_logos', 'mc-logo-light.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'public-vite', 'brand');

// Favicon specifications
const FAVICONS = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-96x96.png', size: 96 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'web-app-manifest-192x192.png', size: 192 },
  { name: 'web-app-manifest-512x512.png', size: 512 },
];

// Background color matching your theme
const BG_COLOR = '#0a0a0a';

async function generateFavicons() {
  console.log('🔧 Generating favicons with dark background...\n');

  // Check source file exists
  if (!fs.existsSync(SOURCE_LOGO)) {
    console.error(`❌ Source logo not found: ${SOURCE_LOGO}`);
    console.log('Please ensure mc-logo-light.png exists in src/images/_logos/');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Load source image
  const sourceImage = sharp(SOURCE_LOGO);
  const metadata = await sourceImage.metadata();

  console.log(`📸 Source: ${metadata.width}x${metadata.height} ${metadata.format}`);
  console.log(`🎨 Background: ${BG_COLOR}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  // Generate each favicon size
  for (const favicon of FAVICONS) {
    const outputPath = path.join(OUTPUT_DIR, favicon.name);
    
    // Create square canvas with background color, center the logo
    await sharp({
      create: {
        width: favicon.size,
        height: favicon.size,
        channels: 4,
        background: BG_COLOR,
      },
    })
      .composite([
        {
          input: await sharp(SOURCE_LOGO)
            .resize(favicon.size - 8, favicon.size - 8, { // 4px padding
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .toBuffer(),
          gravity: 'center',
        },
      ])
      .png()
      .toFile(outputPath);

    console.log(`✅ ${favicon.name} (${favicon.size}x${favicon.size})`);
  }

  // Generate favicon.ico (multi-size ICO file)
  console.log('\n🎯 Generating favicon.ico...');
  // Note: For actual ICO generation, you'd need an ICO library
  // For now, we'll just copy the 32x32 PNG as favicon.ico
  fs.copyFileSync(
    path.join(OUTPUT_DIR, 'favicon-32x32.png'),
    path.join(OUTPUT_DIR, 'favicon.ico')
  );
  console.log('✅ favicon.ico (multi-size placeholder)');

  console.log('\n🎉 All favicons generated successfully!');
  console.log('\n📋 Summary:');
  FAVICONS.forEach(f => console.log(`   • ${f.name}`));
  console.log('   • favicon.ico');
}

generateFavicons().catch(err => {
  console.error('❌ Error generating favicons:', err);
  process.exit(1);
});
