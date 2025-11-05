import path from 'path';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  testDir: path.join(process.cwd(), 'tests', 'playwright'),
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  retries: 0,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ],
};

export default config;
