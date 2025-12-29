import { test } from '@playwright/test';
import endpointFixtures from './fixtures/endpoints.json' with { type: 'json' };

test.describe('Debug Theme Issues', () => {
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

  test('Debug TUI theme - check for table rows', async ({ page }) => {
    const consoleLogs: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      errors.push(`PAGE ERROR: ${err.message}`);
    });

    await page.goto('http://localhost:5173/?theme=tui');
    await page.waitForTimeout(3000); // Wait for any async operations

    // Check if table exists
    const tableExists = await page.locator('.status-table').count();
    console.log(`TUI: Table exists: ${tableExists > 0}`);

    // Check if tbody rows exist
    const rowCount = await page.locator('.status-table tbody tr').count();
    console.log(`TUI: Table rows found: ${rowCount}`);

    // Check if template exists
    const templateExists = await page.locator('#endpoints-template').count();
    console.log(`TUI: Template exists: ${templateExists > 0}`);

    // Get the actual rendered HTML
    const tableHTML = await page.locator('.status-table').innerHTML();
    console.log(`TUI: Table HTML:\n${tableHTML.substring(0, 500)}`);

    // Check console errors
    console.log(`TUI: Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('TUI: Errors:', errors);
    }
  });

  test('Debug GitHub theme - check square colors', async ({ page }) => {
    const consoleLogs: string[] = [];
    const errors: string[] = [];

    page.on('console', (msg) => {
      consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      errors.push(`PAGE ERROR: ${err.message}`);
    });

    await page.goto('http://localhost:5173/?theme=github');
    await page.waitForTimeout(3000);

    // Check if squares exist
    const squareCount = await page.locator('.status-square').count();
    console.log(`GitHub: Squares found: ${squareCount}`);

    // Check square styles
    if (squareCount > 0) {
      const firstSquare = page.locator('.status-square').first();
      const styles = await firstSquare.evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          width: computed.width,
          height: computed.height,
          backgroundColor: computed.backgroundColor,
          border: computed.border,
          display: computed.display,
          className: el.className,
        };
      });
      console.log('GitHub: First square styles:', JSON.stringify(styles, null, 2));
    }

    // Check console errors
    console.log(`GitHub: Console errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log('GitHub: Errors:', errors);
    }
  });
});
