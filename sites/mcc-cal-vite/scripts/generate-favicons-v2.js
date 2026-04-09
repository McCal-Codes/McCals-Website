/**
 * Favicon Generator Script - Dark & Light Mode Support
 * Generates favicon files for both color schemes
 * 
 * Usage: node scripts/generate-favicons.js
 * Requires: npm install sharp
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Source logos - LIGHT has white logo, DARK has black logo
const SOURCE_LOGO_LIGHT = path.join(__dirname, '..', '..', '..', 'src', 'images', '_logos', 'mc-logo-light.png');
const SOURCE_LOGO_DARK = path.join(__dirname, '..', '..', '..', 'src', 'images', '_logos', 'mc-logo-dark.png');
const OUTPUT_DIR = path.join(__dirname, '..', 'public-vite', 'brand');

// Colors
const DARK_BG = '#0a0a0a';
const LIGHT_BG = '#ffffff';

// Sizes
const SIZES = [16, 32, 96];

async function generateFavicons() {
  console.log('🔧 Generating dark & light mode favicons...\n');

  // Check source files exist
  if (!fs.existsSync(SOURCE_LOGO_LIGHT)) {
    console.error(`❌ Source logo not found: ${SOURCE_LOGO_LIGHT}`);
    console.log('Please ensure mc-logo-light.png exists in src/images/_logos/');
    process.exit(1);
  }
  if (!fs.existsSync(SOURCE_LOGO_DARK)) {
    console.error(`❌ Source logo not found: ${SOURCE_LOGO_DARK}`);
    console.log('Please ensure mc-logo-dark.png exists in src/images/_logos/');
    process.exit(1);
  }

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get metadata
  const lightMeta = await sharp(SOURCE_LOGO_LIGHT).metadata();
  const darkMeta = await sharp(SOURCE_LOGO_DARK).metadata();
  console.log(`📸 White logo: ${lightMeta.width}x${lightMeta.height}`);
  console.log(`📸 Black logo: ${darkMeta.width}x${darkMeta.height}`);
  console.log(`🎨 Dark BG: ${DARK_BG} | Light BG: ${LIGHT_BG}\n`);

  // Generate standard sizes for both modes
  for (const size of SIZES) {
    // Dark mode: White logo on dark background
    await generateFavicon(SOURCE_LOGO_LIGHT, size, DARK_BG, `favicon-dark-${size}x${size}.png`);
    
    // Light mode: Black logo on light background
    await generateFavicon(SOURCE_LOGO_DARK, size, LIGHT_BG, `favicon-light-${size}x${size}.png`);
  }

  // Apple touch icon (dark theme for consistency)
  await generateFavicon(SOURCE_LOGO_LIGHT, 180, DARK_BG, 'apple-touch-icon.png');

  // PWA icons (dark theme)
  await generateFavicon(SOURCE_LOGO_LIGHT, 192, DARK_BG, 'web-app-manifest-192x192.png');
  await generateFavicon(SOURCE_LOGO_LIGHT, 512, DARK_BG, 'web-app-manifest-512x512.png');

  // Legacy favicon.ico (dark mode 32x32)
  fs.copyFileSync(
    path.join(OUTPUT_DIR, 'favicon-dark-32x32.png'),
    path.join(OUTPUT_DIR, 'favicon.ico')
  );
  console.log('✅ favicon.ico');

  // Generate adaptive SVG
  generateAdaptiveSVG();

  console.log('\n🎉 All favicons generated successfully!\n');
  console.log('📋 Generated files:');
  const files = fs.readdirSync(OUTPUT_DIR).sort();
  files.filter(f => f.includes('favicon') || f.includes('web-app')).forEach(f => console.log(`   • ${f}`));
}

async function generateFavicon(sourcePath, size, bgColor, filename) {
  const outputPath = path.join(OUTPUT_DIR, filename);
  const padding = Math.max(2, Math.floor(size * 0.1));
  
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: bgColor,
    },
  })
    .composite([
      {
        input: await sharp(sourcePath)
          .resize(size - padding * 2, size - padding * 2, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .toBuffer(),
        gravity: 'center',
      },
    ])
    .png()
    .toFile(outputPath);

  console.log(`✅ ${filename}`);
}

function generateAdaptiveSVG() {
  // Create an adaptive SVG that changes based on color scheme
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <style>
    .bg { fill: #0a0a0a; }
    .logo { fill: #ffffff; }
    @media (prefers-color-scheme: light) {
      .bg { fill: #ffffff; }
      .logo { fill: #0a0a0a; }
    }
  </style>
  <rect class="bg" width="100" height="100" rx="12"/>
  <g class="logo" transform="translate(15, 25) scale(0.7)">
    <!-- Stylized MC monogram -->
    <path d="M10,0 L10,50 M10,25 L40,25" stroke="currentColor" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="55" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="8"/>
    <path d="M55,5 L55,45" stroke="currentColor" stroke-width="8" fill="none"/>
  </g>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'favicon.svg'), svg);
  console.log('✅ favicon.svg (adaptive with CSS media queries)');
}

generateFavicons().catch(err => {
  console.error('❌ Error generating favicons:', err);
  process.exit(1);
});
