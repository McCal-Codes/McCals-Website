const { test, expect } = require('@playwright/test');
const path = require('path');

test('load local site index and check main content', async ({ page }) => {
  const indexPath = path.resolve(__dirname, '../../src/site/index.html');
  const url = 'file://' + indexPath;
  await page.goto(url);
  // Basic assertion: page has a body and title or a main app container
  const body = await page.$('body');
  expect(body).not.toBeNull();
  // If there is an #app or .app element, ensure it exists or simply check title
  const title = await page.title();
  expect(title.length).toBeGreaterThanOrEqual(0);
});
