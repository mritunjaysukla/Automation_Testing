import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    browserName: 'chromium',
    headless: false, // Set to false for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  },
  timeout: 300000, // 5 minutes timeout for manual input tests
  expect: {
    timeout: 30000
  },
  // Run tests in headed mode by default since manual input is required
  workers: 1, // Run one test at a time for manual interaction
  retries: 0 // No retries for manual tests
});
