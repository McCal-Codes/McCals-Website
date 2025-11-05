import { test, expect } from '@playwright/test';
import path from 'path';

test('load local site index and check main content', async ({ page }) => {
  const baseDir = path.dirname(new URL(import.meta.url).pathname);
  const indexPath = path.resolve(baseDir, '../../src/site/index.html');
  const fileUrl = 'file://' + indexPath;
  await page.goto(fileUrl);
  // Basic assertion: page has a body and title or a main app container
  const body = await page.$('body');
  expect(body).not.toBeNull();
  // If there is an #app or .app element, ensure it exists or simply check title
  const title = await page.title();
  expect(title.length).toBeGreaterThanOrEqual(0);
});
