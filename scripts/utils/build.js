#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../..', 'src', 'site');
const BUILD_DIR = path.join(__dirname, '../..', 'dist');

async function main() {
  console.log('🔧 Building McCal Media Website...');

  // Create build directory
  if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }

  // Enhanced copy function with image optimization
  async function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        // Ensure parent directory exists before copying file
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }

        // Optimize images, copy others
        const isImage = /\.(jpe?g|png)$/i.test(entry.name);
        if (isImage) {
          // For now, just copy images - optimization can be added later
          fs.copyFileSync(srcPath, destPath);
          console.log(`  🖼️  ${path.relative(SOURCE_DIR, srcPath)} (copied)`);
        } else {
          fs.copyFileSync(srcPath, destPath);
          console.log(`  ✓ ${path.relative(SOURCE_DIR, srcPath)}`);
        }
      }
    }
  }

  // Copy all files from site to dist
  console.log('📁 Copying files...');
  await copyDirectory(SOURCE_DIR, BUILD_DIR);

  // Copy images directory if it exists
  const IMAGES_DIR = path.join(__dirname, '../..', 'src', 'images');
  if (fs.existsSync(IMAGES_DIR)) {
    const destImagesDir = path.join(BUILD_DIR, 'images');
    console.log('🖼️  Copying images...');
    await copyDirectory(IMAGES_DIR, destImagesDir);
  }

  console.log('✅ Build complete!');
  console.log(`📦 Built files are in: ${BUILD_DIR}`);
  console.log('');
  console.log('Next steps:');
  console.log('  • Test with: npm run serve');
  console.log('  • Deploy to Netlify: npm run deploy:netlify');
  console.log('  • Deploy to Vercel: npm run deploy:vercel');
  console.log('  • Deploy to Surge: npm run deploy:surge');
}

main().catch(error => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});