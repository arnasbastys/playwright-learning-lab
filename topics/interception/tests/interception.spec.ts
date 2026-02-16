import { test, expect } from '@playwright/test';

test.describe('interception topic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('uses fulfilled route to assert success rendering', async ({ page }) => {
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: 'ORD-MOCK-200',
          message: 'Mocked success response.'
        })
      });
    });

    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page.getByRole('status')).toHaveText('Success: ORD-MOCK-200');
    await expect(page.getByRole('alert')).toHaveText('');
  });

  test('uses 500 interception to verify graceful error handling', async ({ page }) => {
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Payment gateway timeout.'
        })
      });
    });

    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page.getByRole('alert')).toHaveText('Payment gateway timeout.');
    await expect(page.getByRole('status')).toHaveText('');
  });

  test('uses response headers in a 429 scenario', async ({ page }) => {
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 429,
        headers: {
          'content-type': 'application/json',
          'retry-after': '30'
        },
        body: JSON.stringify({ message: 'Too many attempts.' })
      });
    });

    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page.getByRole('alert')).toHaveText('Rate limited. Try again in 30s.');
  });

  test('uses malformed JSON to validate parser-failure UX', async ({ page }) => {
    await page.route('**/api/checkout', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{ orderId: bad json }'
      });
    });

    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page.getByRole('alert')).toHaveText('Received invalid JSON from server.');
    await expect(page.getByRole('status')).toHaveText('');
  });

  test('uses aborted route to simulate hard network failure', async ({ page }) => {
    await page.route('**/api/checkout', async (route) => {
      await route.abort('failed');
    });

    await page.getByRole('button', { name: 'Place order' }).click();

    await expect(page.getByRole('alert')).toHaveText('Network failure. Check your connection and retry.');
  });
});
