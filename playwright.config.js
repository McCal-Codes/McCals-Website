const path = require('path');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = {
  testDir: path.join(__dirname, 'tests', 'playwright'),
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  retries: process.env.CI ? 3 : 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:5173',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
};
