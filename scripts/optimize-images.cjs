#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.error('sharp is not installed. Please run: npm install --save-dev sharp fast-glob');
    process.exit(2);
  }

  const fg = require('fast-glob');
  const src = path.join(process.cwd(), 'src', 'images', 'Portfolios');
  const outRoot = path.join(process.cwd(), 'dist', 'optimized-images');
  if (!fs.existsSync(src)) {
    console.error('Source images folder not found:', src);
    process.exit(1);
  }
  await fs.promises.mkdir(outRoot, { recursive: true });

  const patterns = ['**/*.{jpg,jpeg,png}'];
  const entries = await fg(patterns, { cwd: src, dot: false, onlyFiles: true });
  if (!entries.length) {
    console.log('No images found to optimize.');
    return;
  }

  console.log(`Found ${entries.length} images. Optimizing into ${outRoot}`);

  for (const rel of entries) {
    const srcPath = path.join(src, rel);
    const outDir = path.join(outRoot, path.dirname(rel));
    await fs.promises.mkdir(outDir, { recursive: true });

    const baseName = path.basename(rel, path.extname(rel));
    const outWebp = path.join(outDir, baseName + '.webp');
    const outJpg = path.join(outDir, baseName + '.jpg');

    try {
      const pipeline = sharp(srcPath).rotate();
      // write WebP
      await pipeline.clone().webp({ quality: 80 }).toFile(outWebp);
      // write optimized JPG
      await pipeline.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(outJpg);
      console.log(`Optimized: ${rel} -> webp/jpg`);
    } catch (err) {
      console.error('Failed to optimize', rel, err.message);
    }
  }
  console.log('Image optimization complete. Outputs in', outRoot);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
