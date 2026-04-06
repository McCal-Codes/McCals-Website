const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5173';

test.describe('Critical User Flows', () => {
  test('homepage loads with hero and navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check page title
    await expect(page).toHaveTitle(/McCal Media/);
    
    // Check hero section exists
    const hero = page.locator('hero-carousel, .hero, [class*="hero"]').first();
    await expect(hero).toBeVisible();
    
    // Check navigation is present
    const nav = page.locator('nav, header nav, [role="navigation"]').first();
    await expect(nav).toBeVisible();
    
    // Check footer is present
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
  });

  test('blog navigation and post display', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Navigate to blog
    const blogLink = page.locator('a[href*="blog"], a:has-text("Blog"), a:has-text("Stories")').first();
    if (await blogLink.isVisible().catch(() => false)) {
      await blogLink.click();
      await page.waitForLoadState('networkidle');
      
      // Check blog content loads
      const blogContent = page.locator('.blog, [class*="blog"], article, .post').first();
      await expect(blogContent).toBeVisible({ timeout: 5000 });
    }
  });

  test('podcast page loads with player elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/podcast`);
    
    // Check page title contains podcast
    const title = await page.title();
    expect(title.toLowerCase()).toContain('podcast');
    
    // Check for podcast content or episode cards
    const podcastContent = page.locator('.podcast, [class*="podcast"], .episode, audio, [class*="player"]').first();
    await expect(podcastContent).toBeVisible({ timeout: 5000 });
  });

  test('contact page has form elements', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact-us`);
    
    // Check for form or contact elements
    const form = page.locator('form, input[type="email"], textarea, button[type="submit"]').first();
    await expect(form).toBeVisible({ timeout: 5000 });
    
    // Check page has contact-related content
    const bodyText = await page.textContent('body');
    expect(bodyText.toLowerCase()).toMatch(/contact|email|message|form/);
  });
});
