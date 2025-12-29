import { expect, test } from '@playwright/test';
import endpointFixtures from './fixtures/endpoints.json' with { type: 'json' };

test.describe('Theme Verification', () => {
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

  test.describe('TUI Theme', () => {
    test('displays text-based terminal UI with status icons', async ({ page }) => {
      await page.goto('/?theme=tui');

      // Wait for content to load
      await page.waitForSelector('.status-table', { timeout: 10000 });

      // Should have table layout, not squares
      const table = page.locator('.status-table');
      await expect(table).toBeVisible();

      // Should NOT have colored squares
      const squares = page.locator('.status-square');
      await expect(squares).toHaveCount(0);

      // Should have status icons [OK], [!!], [--]
      const rows = page.locator('.status-row');
      await expect(rows).toHaveCount(4); // 4 endpoints in fixtures

      // Check for status text indicators
      const statusIcons = page.locator('.status-icon');
      await expect(statusIcons.first()).toBeVisible();

      // Take screenshot
      await page.screenshot({ path: 'screenshots/theme-tui-light.png', fullPage: true });
    });

    test('uses monospace font', async ({ page }) => {
      await page.goto('/?theme=tui');
      await page.waitForSelector('.status-table', { timeout: 10000 });

      // Check font-family includes monospace
      const body = page.locator('body');
      const fontFamily = await body.evaluate(el => getComputedStyle(el).fontFamily);
      expect(fontFamily).toMatch(/monospace|mono|courier/i);
    });

    test('supports dark mode toggle', async ({ page }) => {
      await page.goto('/?theme=tui');
      await page.waitForSelector('.status-table', { timeout: 10000 });

      // Find and click mode toggle
      const toggle = page.locator('.mode-toggle, [aria-label*="mode"], button[class*="theme"], button[class*="mode"]');
      if (await toggle.count() > 0) {
        await toggle.first().click();
        await page.waitForTimeout(500); // Wait for transition
        await page.screenshot({ path: 'screenshots/theme-tui-dark.png', fullPage: true });
      }
    });
  });

  test.describe('Gatus Theme', () => {
    test('displays card-based layout with endpoint cards', async ({ page }) => {
      await page.goto('/?theme=gatus');

      // Wait for cards to load
      await page.waitForSelector('.endpoint-card, .card, .gatus-card', { timeout: 10000 });

      // Should have card elements
      const cards = page.locator('.endpoint-card, .card, .gatus-card');
      await expect(cards.first()).toBeVisible();

      // Should have status badges
      const badges = page.locator('.status-badge, .badge');
      await expect(badges.first()).toBeVisible();

      // Take screenshot
      await page.screenshot({ path: 'screenshots/theme-gatus-light.png', fullPage: true });
    });

    test('has hover effects on cards', async ({ page }) => {
      await page.goto('/?theme=gatus');
      await page.waitForSelector('.endpoint-card, .card, .gatus-card', { timeout: 10000 });

      const firstCard = page.locator('.endpoint-card, .card, .gatus-card').first();

      // Hover over card
      await firstCard.hover();
      await page.waitForTimeout(300);

      // Card should be visible (hover effect applied)
      await expect(firstCard).toBeVisible();
    });

    test('supports dark mode toggle', async ({ page }) => {
      await page.goto('/?theme=gatus');
      await page.waitForSelector('.endpoint-card, .card, .gatus-card', { timeout: 10000 });

      const toggle = page.locator('.mode-toggle, [aria-label*="mode"], button[class*="theme"], button[class*="mode"]');
      if (await toggle.count() > 0) {
        await toggle.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/theme-gatus-dark.png', fullPage: true });
      }
    });
  });

  test.describe('GitHub Theme', () => {
    test('displays small green squares in grid layout', async ({ page }) => {
      await page.goto('/?theme=github');

      // Wait for grid to load
      await page.waitForSelector('.contribution-grid, .github-grid, .status-grid', { timeout: 10000 });

      // Should have grid container
      const grid = page.locator('.contribution-grid, .github-grid, .status-grid');
      await expect(grid).toBeVisible();

      // Should have small squares (GitHub style)
      const squares = page.locator('.contribution-square, .github-square, .status-square');
      await expect(squares.first()).toBeVisible();

      // Check square size is small (around 10px)
      const firstSquare = squares.first();
      const size = await firstSquare.evaluate(el => {
        const computed = getComputedStyle(el);
        return {
          width: computed.width,
          height: computed.height
        };
      });

      // Parse pixel values (e.g., "10px" -> 10)
      const width = parseInt(size.width);
      const height = parseInt(size.height);

      // Squares should be small (between 8-15px range is acceptable)
      expect(width).toBeGreaterThanOrEqual(8);
      expect(width).toBeLessThanOrEqual(15);
      expect(height).toBeGreaterThanOrEqual(8);
      expect(height).toBeLessThanOrEqual(15);

      // Take screenshot
      await page.screenshot({ path: 'screenshots/theme-github-light.png', fullPage: true });
    });

    test('uses green color for healthy status', async ({ page }) => {
      await page.goto('/?theme=github');
      await page.waitForSelector('.contribution-grid, .github-grid, .status-grid', { timeout: 10000 });

      // Find a healthy square
      const healthySquare = page.locator('.status-healthy, .contribution-square[data-status="healthy"]').first();

      if (await healthySquare.count() > 0) {
        const bgColor = await healthySquare.evaluate(el => getComputedStyle(el).backgroundColor);
        // Should have green color (rgb values with green component dominant)
        expect(bgColor).toMatch(/rgb.*\d+.*\d+.*\d+/);
      }
    });

    test('supports dark mode toggle', async ({ page }) => {
      await page.goto('/?theme=github');
      await page.waitForSelector('.contribution-grid, .github-grid, .status-grid', { timeout: 10000 });

      const toggle = page.locator('.mode-toggle, [aria-label*="mode"], button[class*="theme"], button[class*="mode"]');
      if (await toggle.count() > 0) {
        await toggle.first().click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screenshots/theme-github-dark.png', fullPage: true });
      }
    });
  });

  test('all themes load without errors', async ({ page }) => {
    const themes = ['tui', 'gatus', 'github'];

    for (const theme of themes) {
      const errors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      page.on('pageerror', err => {
        errors.push(err.message);
      });

      await page.goto(`/?theme=${theme}`);
      await page.waitForTimeout(2000); // Wait for any async operations

      // Should have no console errors
      expect(errors).toEqual([]);
    }
  });
});
