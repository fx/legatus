import { test } from '@playwright/test';
import endpointFixtures from './fixtures/endpoints.json' with { type: 'json' };

/**
 * This test captures screenshots of all three themes for manual verification.
 * Run with: bun run test:e2e e2e/screenshot-themes.spec.ts
 */

test.describe('Theme Screenshots', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the Gatus API endpoint
    await page.route('**/api/v1/endpoints/statuses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(endpointFixtures),
      });
    });
  });

  test('TUI theme - light mode', async ({ page }) => {
    await page.goto('http://localhost:5173/?theme=tui');
    // Wait for the status table to be rendered (TUI theme specific)
    await page.waitForSelector('.status-table tbody tr', { timeout: 10000 });
    await page.waitForTimeout(500); // Extra time for rendering
    await page.screenshot({ path: 'screenshots/tui-light.png', fullPage: true });
  });

  test('TUI theme - dark mode', async ({ page }) => {
    await page.goto('http://localhost:5173/?theme=tui');
    await page.waitForSelector('.status-table tbody tr', { timeout: 10000 });

    // Try to find and click theme toggle (TUI theme doesn't have one, but attempt anyway)
    const toggle = page.locator('.mode-toggle, .theme-toggle, button[aria-label*="mode"], button[aria-label*="theme"]');
    if (await toggle.count() > 0) {
      await toggle.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'screenshots/tui-dark.png', fullPage: true });
  });

  test('Gatus theme - light mode', async ({ page }) => {
    await page.goto('http://localhost:5173/?theme=gatus');
    // Wait for endpoint cards to be rendered (Gatus theme specific)
    await page.waitForSelector('.endpoint-card', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/gatus-light.png', fullPage: true });
  });

  test('Gatus theme - dark mode', async ({ page }) => {
    await page.goto('http://localhost:5173/?theme=gatus');
    await page.waitForSelector('.endpoint-card', { timeout: 10000 });

    const toggle = page.locator('.mode-toggle');
    if (await toggle.count() > 0) {
      await toggle.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'screenshots/gatus-dark.png', fullPage: true });
  });

  test('GitHub theme - light mode', async ({ page }) => {
    await page.goto('http://localhost:5173/?theme=github');
    // Wait for status squares to be rendered (GitHub theme specific)
    await page.waitForSelector('.status-square', { timeout: 10000 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/github-light.png', fullPage: true });
  });

  test('GitHub theme - dark mode', async ({ page }) => {
    await page.goto('http://localhost:5173/?theme=github');
    await page.waitForSelector('.status-square', { timeout: 10000 });

    const toggle = page.locator('.theme-toggle');
    if (await toggle.count() > 0) {
      await toggle.first().click();
      await page.waitForTimeout(500);
    }

    await page.screenshot({ path: 'screenshots/github-dark.png', fullPage: true });
  });
});
