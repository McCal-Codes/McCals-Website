import { test, expect } from '@playwright/test';
import path from 'path';
import { pathToFileURL } from 'url';

const playgroundPath = path.join(process.cwd(), 'src', 'widgets', 'css-playground', 'versions', 'v1.3.html');
const fileUrl = pathToFileURL(playgroundPath).toString();

test.describe('Nav visual regression – playground', () => {
  test('nav - light theme', async ({ page }) => {
    await page.goto(fileUrl + '?theme=light');
    // Nav is present directly in the playground document for v1.3
    const navLocator = page.locator('nav.mcc-nav');
    await navLocator.waitFor({ state: 'visible', timeout: 5000 });
    const screenshot = await navLocator.screenshot();
    expect(screenshot).toMatchSnapshot('nav-light.png');
  });

  test('nav - dark theme', async ({ page }) => {
    await page.goto(fileUrl + '?theme=dark');
    const navLocator = page.locator('nav.mcc-nav');
    await navLocator.waitFor({ state: 'visible', timeout: 5000 });
    const screenshot = await navLocator.screenshot();
    expect(screenshot).toMatchSnapshot('nav-dark.png');
  });
});
