/* global axe, document */
const { firefox } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://localhost:3000';
  console.log(`Running axe-core accessibility scan against ${url} using Firefox...`);
  const browser = await firefox.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    // Inject axe-core from CDN
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js' });
    const results = await page.evaluate(async () => {
      return await axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2aa']
        }
      });
    });
    const out = JSON.stringify(results, null, 2);
    console.log(out);
    // Also write to file in reports/
    const fs = require('fs');
    try { fs.mkdirSync('reports', { recursive: true }); }
    catch (e) {
      console.warn('Could not create reports directory:', e.message);
    }
    fs.writeFileSync('reports/axe-firefox-results.json', out);
    console.log('Saved results to reports/axe-firefox-results.json');
  } catch (err) {
    console.error('Error running axe:', err);
    process.exitCode = 2;
  } finally {
    await browser.close();
  }
})();
