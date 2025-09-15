// scripts/gen-manifest.js
// Usage: node scripts/gen-manifest.js "images/Portfolios/Concert/The Book Club/The Book Club"
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) {
  console.error('Usage: node scripts/gen-manifest.js "<relative/images/folder>"');
  process.exit(1);
}

const abs = path.resolve(process.cwd(), dir);
if (!fs.existsSync(abs)) {
  console.error('Directory not found:', abs);
  process.exit(2);
}

const files = fs.readdirSync(abs)
  .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

const outPath = path.join(abs, 'manifest.json');
fs.writeFileSync(outPath, JSON.stringify(files, null, 2) + '\n');
console.log(`Wrote ${files.length} entries to ${outPath}`);
