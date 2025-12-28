import { expect, test } from '@playwright/test';
import endpointFixtures from './fixtures/endpoints.json' with { type: 'json' };

test.describe('Status Grid', () => {
  test.beforeEach(async ({ page }) => {
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

  test('page loads successfully with title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Gatus Status');
  });

  test('status grid renders with correct number of squares', async ({ page }) => {
    await page.goto('/');

    // Wait for the status grid to appear (HTMX renders after API response)
    const grid = page.locator('.status-grid');
    await expect(grid).toBeVisible({ timeout: 10000 });

    // Should have 4 status squares (matching our fixture data)
    const squares = page.locator('.status-square');
    await expect(squares).toHaveCount(4);
  });

  test('displays healthy, unhealthy, and unknown status colors', async ({ page }) => {
    await page.goto('/');

    // Wait for grid to load
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Check for healthy squares (Frontend and API Gateway)
    const healthySquares = page.locator('.status-healthy');
    await expect(healthySquares).toHaveCount(2);

    // Check for unhealthy square (Database)
    const unhealthySquares = page.locator('.status-unhealthy');
    await expect(unhealthySquares).toHaveCount(1);

    // Check for unknown square (Cache - no results)
    const unknownSquares = page.locator('.status-unknown');
    await expect(unknownSquares).toHaveCount(1);
  });

  test('popover appears on click and shows endpoint details', async ({ page }) => {
    await page.goto('/');

    // Wait for grid to load
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Click the first status square (Frontend)
    const firstSquare = page.locator('.status-square').first();
    await firstSquare.click();

    // Popover should appear
    const popover = page.locator('.status-popover').first();
    await expect(popover).toBeVisible();

    // Check popover content
    await expect(popover.locator('.popover-name')).toHaveText('Frontend');
    await expect(popover.locator('.popover-group')).toHaveText('web');
    await expect(popover.locator('.status-badge')).toHaveText('Healthy');
  });

  test('popover shows response time and conditions', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Click the first status square
    await page.locator('.status-square').first().click();

    const popover = page.locator('.status-popover').first();
    await expect(popover).toBeVisible();

    // Check response time is displayed
    await expect(popover.locator('.detail-row').first()).toContainText('Response');
    await expect(popover.locator('.detail-value').first()).toContainText('45ms');

    // Check conditions are displayed
    await expect(popover.locator('.conditions-section')).toBeVisible();
    await expect(popover.locator('.condition-item')).toHaveCount(2);
  });

  test('unhealthy endpoint shows failure status', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Click the unhealthy square (Database)
    await page.locator('.status-unhealthy').click();

    const popover = page.locator('[popover]:popover-open');
    await expect(popover).toBeVisible();

    // Check unhealthy status
    await expect(popover.locator('.popover-name')).toHaveText('Database');
    await expect(popover.locator('.status-badge-unhealthy')).toHaveText('Unhealthy');

    // Check failed condition icon
    await expect(popover.locator('.condition-icon-failure')).toBeVisible();
  });

  test('unknown status endpoint shows no results message', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Click the unknown square (Cache)
    await page.locator('.status-unknown').click();

    const popover = page.locator('[popover]:popover-open');
    await expect(popover).toBeVisible();

    // Check unknown status
    await expect(popover.locator('.popover-name')).toHaveText('Cache');
    await expect(popover.locator('.status-badge-unknown')).toHaveText('Unknown');
    await expect(popover.locator('.no-results')).toContainText('No health check results');
  });

  test('status squares have accessible labels', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.status-grid')).toBeVisible({ timeout: 10000 });

    // Check that squares have aria-label
    const firstSquare = page.locator('.status-square').first();
    await expect(firstSquare).toHaveAttribute('aria-label', /Frontend.*web.*Healthy/);
  });
});
