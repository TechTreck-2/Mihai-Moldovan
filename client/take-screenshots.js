const path = require('path');

// Add client node_modules to the module search path
const clientNodeModules = path.join(__dirname, '..', 'client', 'node_modules');
require('module').globalPaths.push(clientNodeModules);

const { chromium } = require('playwright');
const fs = require('fs');

async function takeScreenshots() {
  const browser = await chromium.launch();

  // Get base URL from environment variable or use localhost for local testing
  let baseUrl = process.env.BASE_URL || 'http://localhost:4200';

  // Trim whitespace and remove trailing slash to avoid double slashes in URLs
  baseUrl = baseUrl.trim().replace(/\/$/, '');

  console.log(`Taking screenshots from: ${baseUrl}`);

  const pages = [
    {
      name: 'login',
      url: `${baseUrl}/#/login`,
      waitFor: '[data-cy="login-card"]',
      actions: []
    },
    {
      name: 'clocking',
      url: `${baseUrl}/#/clocking`,
      waitFor: '[data-cy="clocking-page"], .clocking-container, .timer-container, body',
      actions: [
        async (page) => {
          // Navigate to login first to set up authentication properly
          await page.goto(`${baseUrl}/#/login`);

          // Mock login by setting localStorage with correct format
          await page.evaluate(() => {
            localStorage.setItem('JWT_TOKEN', 'mock-jwt-token');
            localStorage.setItem('CURRENT_USER', 'demo@example.com');
          });
        }
      ]
    },
    {
      name: 'holiday',
      url: `${baseUrl}/#/holiday`,
      waitFor: '.holiday-planner-container, .holiday-container, body',
      actions: [
        async (page) => {
          // Navigate to login first to set up authentication properly
          await page.goto(`${baseUrl}/#/login`);

          // Mock login by setting localStorage with correct format
          await page.evaluate(() => {
            localStorage.setItem('JWT_TOKEN', 'mock-jwt-token');
            localStorage.setItem('CURRENT_USER', 'demo@example.com');
          });
        }
      ]
    }
  ];

  const themes = ['light', 'dark'];

  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(process.cwd(), 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  for (const pageDef of pages) {
    for (const theme of themes) {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        colorScheme: theme
      });

      const page = await context.newPage();

      // Mock API responses
      await page.route('**/api/**', route => {
        const url = route.request().url();
        if (url.includes('/auth/login')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              access_token: 'mock-jwt-token'
            })
          });
        } else if (url.includes('/clockings')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([])
          });
        } else if (url.includes('/holidays')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 1,
                holidayName: 'Summer Vacation',
                startDate: '2024-07-15',
                endDate: '2024-07-25'
              }
            ])
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({})
          });
        }
      });

      // Execute pre-actions for auth setup
      for (const action of pageDef.actions) {
        await action(page);
      }

      // Navigate to the target page after setting up auth
      console.log(`Navigating to ${pageDef.url} (${theme} theme)...`);
      console.log(`DEBUG: Full URL being used: "${pageDef.url}"`);
      await page.goto(pageDef.url);
      await page.waitForTimeout(1000); // Wait for navigation and auth check

      // Set theme preference with more comprehensive approach
      await page.evaluate((themeValue) => {
        // Set localStorage theme
        localStorage.setItem('theme-preference', themeValue);
        localStorage.setItem('theme', themeValue);

        // Apply theme to document
        document.documentElement.setAttribute('data-theme', themeValue);
        document.documentElement.setAttribute('theme', themeValue);

        // Add/remove theme classes
        if (themeValue === 'dark') {
          document.documentElement.classList.add('dark-theme', 'dark');
          document.body.classList.add('dark-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark-theme', 'dark');
          document.body.classList.remove('dark-theme', 'dark');
          document.documentElement.classList.add('light-theme', 'light');
          document.body.classList.add('light-theme', 'light');
        }

        // Trigger any theme change events
        window.dispatchEvent(new CustomEvent('themechange', { detail: themeValue }));

        // Force Angular Material theme update if available
        if (window.angular && window.angular.reloadWithDebugInfo) {
          console.log('Theme set to:', themeValue);
        }
      }, theme);

      // Wait a bit for theme to apply
      await page.waitForTimeout(1000);

      // Wait for page to load
      try {
        await page.waitForSelector(pageDef.waitFor, { timeout: 15000 });
        await page.waitForTimeout(2000); // Additional wait for animations
      } catch (error) {
        console.log(`Warning: Could not find selector ${pageDef.waitFor} for ${pageDef.name}-${theme}`);
        await page.waitForTimeout(3000); // Still wait a bit
      }

      // Hide scrollbars for cleaner screenshots
      await page.addStyleTag({
        content: `
          ::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; }
          body { overflow: hidden; }
        `
      });

      const screenshotPath = path.join(screenshotsDir, `${pageDef.name}-${theme}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1920, height: 1080 }
      });

      console.log(`Screenshot saved: ${screenshotPath}`);
      await context.close();
    }
  }

  await browser.close();
  console.log('All screenshots completed!');
}

if (require.main === module) {
  takeScreenshots().catch(console.error);
}

module.exports = { takeScreenshots };