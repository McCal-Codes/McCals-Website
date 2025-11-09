const assert = require('assert');

// Use shared sitemap parser utility
const { parseTopLevelSlugs } = require('../scripts/utils/sitemap-parser.js');

function parseTopLevelSlugsFromSitemap(xmlText, base = 'https://example.test') {
  return parseTopLevelSlugs(xmlText, base);
}

// --- Tests ---
(function runTests(){
  console.log('Running sitemap parser tests... - sitemap-parser.test.js:12');

  const sample1 = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>https://example.test/</loc></url>
    <url><loc>https://example.test/concerts/2025/11/01</loc></url>
    <url><loc>https://example.test/events/2025-10-21</loc></url>
    <url><loc>https://example.test/journalism/story-1</loc></url>
    <url><loc>https://example.test/portraits/album1</loc></url>
    <url><loc>https://example.test/nature/2024/08/15</loc></url>
  </urlset>`;

  const got1 = parseTopLevelSlugsFromSitemap(sample1, 'https://example.test');
  // expected to include these top-level slugs (order not important)
  assert(got1.includes('concerts'), 'expected concerts');
  assert(got1.includes('events'), 'expected events');
  assert(got1.includes('journalism'), 'expected journalism');
  assert(got1.includes('portraits'), 'expected portraits');
  assert(got1.includes('nature'), 'expected nature');

  // sample with relative urls and mixed-case
  const sample2 = `<?xml version="1.0"?>\n<urlset>\n  <url><loc>/Concerts/2025/11</loc></url>\n  <url><loc>/Featured-Work/cover</loc></url>\n  <url><loc>http://example.test/Nature</loc></url>\n</urlset>`;
  const got2 = parseTopLevelSlugsFromSitemap(sample2, 'https://example.test');
  assert(got2.includes('concerts'), 'expected concerts from relative/mixed-case');
  assert(got2.includes('featured-work'), 'expected featured-work');
  assert(got2.includes('nature'), 'expected nature');

  // sample with malformed loc and whitespace
  const sample3 = `<urlset> <url><loc>   </loc></url> <url><loc>https://example.test///portraits///123</loc></url> </urlset>`;
  const got3 = parseTopLevelSlugsFromSitemap(sample3, 'https://example.test');
  assert(got3.includes('portraits'), 'expected portraits despite extra slashes');

  // empty input
  assert.deepStrictEqual(parseTopLevelSlugsFromSitemap('', 'https://example.test'), []);

  console.log('All sitemap parser tests passed. - sitemap-parser.test.js:47');
})();
