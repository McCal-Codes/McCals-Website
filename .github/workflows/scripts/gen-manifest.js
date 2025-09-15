// Usage: node scripts/gen-manifest.js <dirPath>
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if(!dir) { console.error('Missing dir'); process.exit(1); }

const abs = path.resolve(process.cwd(), dir);
const files = fs.readdirSync(abs)
  .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  .sort((a,b)=> a.localeCompare(b, undefined, {numeric:true, sensitivity:'base'}));

fs.writeFileSync(path.join(abs, 'manifest.json'), JSON.stringify(files, null, 2) + '\n');
console.log(`Wrote ${files.length} entries to ${path.join(abs, 'manifest.json')}`);
