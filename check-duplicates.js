const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/images/Portfolios/Journalism/journalism-manifest.json', 'utf8'));

const counts = {};
const locations = {};
data.events.forEach((e, index) => {
  counts[e.eventName] = (counts[e.eventName] || 0) + 1;
  if (!locations[e.eventName]) locations[e.eventName] = [];
  locations[e.eventName].push(index);
});

const dups = Object.entries(counts).filter(([k, v]) => v > 1);
if (dups.length === 0) {
  console.log('✓ No duplicate eventNames found in journalism-manifest.json');
} else {
  console.log('✗ DUPLICATES FOUND:');
  dups.forEach(([name, count]) => {
    console.log(`  - "${name}" appears ${count} times at indices: ${locations[name].join(', ')}`);
  });
}
process.exit(dups.length > 0 ? 1 : 0);
