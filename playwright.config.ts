import { defineConfig, devices } from '@playwright/test'

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e/tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'e2e/reports/html' }],
    ['json', { outputFile: 'e2e/reports/test-results.json' }],
    ['junit', { outputFile: 'e2e/reports/junit.xml' }]
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.EXPO_PUBLIC_URL || 'http://localhost:8081',
    
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording */
    video: 'retain-on-failure',
    
    /* Network activity recording */
    recordHar: 'retain-on-failure',
    
    /* Timeout for each action */
    actionTimeout: 10000,
    
    /* Timeout for navigation actions */
    navigationTimeout: 30000
  },

  /* Configure projects for major browsers and mobile devices */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Mobile-specific settings for React Native Web
        viewport: { width: 393, height: 851 },
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true,
      },
    },
    
    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'],
        // iOS-specific settings
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },

    /* Tablet testing */
    {
      name: 'iPad',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },

    /* Test different network conditions */
    {
      name: 'Mobile Chrome - Slow 3G',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 393, height: 851 },
        deviceScaleFactor: 2.75,
        isMobile: true,
        hasTouch: true,
      },
      // Configure slow 3G network conditions
      contextOptions: {
        // Simulate slow 3G: 1.6 Mbps down, 750 Kbps up, 150ms RTT
        offline: false,
        // Note: Network throttling would be configured in test files
      }
    },
  ],

  /* Global setup and teardown */
  globalSetup: './e2e/setup/global-setup.ts',
  globalTeardown: './e2e/setup/global-teardown.ts',

  /* Test timeout */
  timeout: 60000,

  /* Expect timeout */
  expect: {
    timeout: 10000,
    // Custom matchers for React Native Web testing
    toMatchScreenshot: { 
      mode: 'strict',
      animations: 'disabled'
    }
  },

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  outputDir: 'e2e/test-results/',

  /* Web server configuration - for local development */
  webServer: process.env.CI ? undefined : {
    command: 'npm run web',
    port: 8081,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Maximum number of concurrent workers */
  maxFailures: process.env.CI ? 10 : 3,
})
