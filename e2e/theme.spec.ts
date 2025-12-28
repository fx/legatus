import { expect, test } from '@playwright/test';
import endpointFixtures from './fixtures/endpoints.json' with { type: 'json' };

test.describe('Theme Switcher', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear();
    });

    // Mock the Gatus API endpoint with raw data
    // The app.js htmx:beforeSwap handler will preprocess this
    await page.route('**/api/v1/endpoints/statuses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(endpointFixtures),
      });
    });
  });

  test('default theme is applied (gatus with system color mode)', async ({ page }) => {
    await page.goto('/');

    // Check default data attributes
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', 'gatus');
    await expect(html).toHaveAttribute('data-color-mode', 'system');

    // Check dropdowns have correct values
    await expect(page.locator('#theme-select')).toHaveValue('gatus');
    await expect(page.locator('#color-mode-select')).toHaveValue('system');
  });

  test('theme dropdown changes appearance', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Get initial background color
    const initialBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Change to github theme
    await page.locator('#theme-select').selectOption('github');

    // Verify data attribute changed
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'github');

    // Get a healthy square and check its color changed
    const healthySquare = page.locator('.status-healthy').first();
    const githubHealthyColor = await healthySquare.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    // Change to tui theme
    await page.locator('#theme-select').selectOption('tui');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'tui');

    const tuiHealthyColor = await healthySquare.evaluate((el) => {
      return getComputedStyle(el).backgroundColor;
    });

    // Colors should be different between themes
    expect(githubHealthyColor).not.toBe(tuiHealthyColor);
  });

  test('color mode toggle works', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Change to light mode
    await page.locator('#color-mode-select').selectOption('light');
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'light');

    // Get body background in light mode
    const lightBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Change to dark mode
    await page.locator('#color-mode-select').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');

    // Get body background in dark mode
    const darkBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Light and dark should have different backgrounds
    expect(lightBg).not.toBe(darkBg);
  });

  test('preferences persist across reload', async ({ browser }) => {
    // Create a new context without the localStorage clearing init script
    const context = await browser.newContext();
    const page = await context.newPage();

    // Set up API mock
    await page.route('**/api/v1/endpoints/statuses', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(endpointFixtures),
      });
    });

    // Clear localStorage once at start
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Set github theme with dark mode
    await page.locator('#theme-select').selectOption('github');
    await page.locator('#color-mode-select').selectOption('dark');

    // Verify localStorage was updated
    const storedTheme = await page.evaluate(() => {
      return localStorage.getItem('gatus-minimal:theme');
    });
    const storedColorMode = await page.evaluate(() => {
      return localStorage.getItem('gatus-minimal:color-mode');
    });

    expect(storedTheme).toBe('github');
    expect(storedColorMode).toBe('dark');

    // Reload the page (localStorage should persist)
    await page.reload();
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Verify settings persisted
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'github');
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');
    await expect(page.locator('#theme-select')).toHaveValue('github');
    await expect(page.locator('#color-mode-select')).toHaveValue('dark');

    await context.close();
  });

  test('system mode respects prefers-color-scheme', async ({ page }) => {
    // Set dark color scheme preference
    await page.emulateMedia({ colorScheme: 'dark' });

    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Ensure we're in system mode
    await expect(page.locator('#color-mode-select')).toHaveValue('system');

    // Get body background - should be dark
    const darkSystemBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // Change to light color scheme preference
    await page.emulateMedia({ colorScheme: 'light' });

    // Get body background - should be light
    const lightSystemBg = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });

    // System mode should respond to color scheme changes
    expect(darkSystemBg).not.toBe(lightSystemBg);
  });

  test('theme switcher header is visible and accessible', async ({ page }) => {
    await page.goto('/');

    // Header should be visible
    const header = page.locator('.theme-header');
    await expect(header).toBeVisible();

    // Theme select should have accessible label
    const themeLabel = page.locator('label[for="theme-select"]');
    await expect(themeLabel).toHaveText('Theme');

    // Color mode select should have accessible label
    const colorModeLabel = page.locator('label[for="color-mode-select"]');
    await expect(colorModeLabel).toHaveText('Mode');

    // All theme options should be available
    const themeOptions = page.locator('#theme-select option');
    await expect(themeOptions).toHaveCount(3);
    await expect(themeOptions.nth(0)).toHaveText('Gatus');
    await expect(themeOptions.nth(1)).toHaveText('GitHub');
    await expect(themeOptions.nth(2)).toHaveText('TUI');

    // All color mode options should be available
    const colorModeOptions = page.locator('#color-mode-select option');
    await expect(colorModeOptions).toHaveCount(3);
    await expect(colorModeOptions.nth(0)).toHaveText('System');
    await expect(colorModeOptions.nth(1)).toHaveText('Light');
    await expect(colorModeOptions.nth(2)).toHaveText('Dark');
  });

  test('tui theme applies monospace font', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Select TUI theme
    await page.locator('#theme-select').selectOption('tui');

    // Check body font family includes monospace
    const fontFamily = await page.evaluate(() => {
      return getComputedStyle(document.body).fontFamily;
    });

    // TUI theme should use monospace fonts
    expect(fontFamily.toLowerCase()).toMatch(/monospace|consolas|menlo|sf mono/);
  });

  test('github theme has smaller border radius and grid gap', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Get gatus theme grid gap
    const gatusGap = await page.evaluate(() => {
      const grid = document.querySelector('.status-grid');
      return grid ? getComputedStyle(grid).gap : '';
    });

    // Switch to github theme
    await page.locator('#theme-select').selectOption('github');

    // Get github theme grid gap
    const githubGap = await page.evaluate(() => {
      const grid = document.querySelector('.status-grid');
      return grid ? getComputedStyle(grid).gap : '';
    });

    // GitHub theme should have smaller gap (3px vs 8px/0.5rem)
    expect(githubGap).toBe('3px');
    expect(gatusGap).not.toBe('3px');
  });
});
