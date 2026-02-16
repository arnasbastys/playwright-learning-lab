import { test, expect } from '@playwright/test';

test.describe('response surgery topic', () => {
  test('keeps real response but injects an extreme discount', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      const response = await route.fetch();
      const payload = (await response.json()) as {
        products: Array<{ id: string; title: string; price: number; inStock: boolean }>;
      };

      payload.products = payload.products.map((product) =>
        product.id === 'P-002' ? { ...product, price: 99 } : product
      );

      await route.fulfill({ response, json: payload });
    });

    await page.goto('/response-surgery');

    await expect(page.getByTestId('catalog-list')).toContainText('Desk Lamp');
    await expect(page.getByTestId('catalog-list')).toContainText('$0.99');
  });

  test('injects schema drift to validate corruption fallback UI', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      const response = await route.fetch();
      const payload = (await response.json()) as {
        products: Array<Record<string, unknown>>;
      };

      payload.products[0] = { id: 'BROKEN-1', price: 'oops-string-price' };

      await route.fulfill({ response, json: payload });
    });

    await page.goto('/response-surgery');

    await expect(page.locator('[data-testid="product-corrupt"]')).toHaveCount(1);
  });

  test('adds a ghost product only in test to validate visual handling', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      const response = await route.fetch();
      const payload = (await response.json()) as {
        products: Array<{ id: string; title: string; price: number; inStock: boolean }>;
      };

      payload.products.push({
        id: 'GHOST-404',
        title: 'Phantom SSD',
        price: 1,
        inStock: false
      });

      await route.fulfill({ response, json: payload });
    });

    await page.goto('/response-surgery');

    await expect(page.getByTestId('catalog-state')).toHaveText('4 product(s) loaded.');
    await expect(page.getByTestId('catalog-list')).toContainText('Phantom SSD');
    await expect(page.getByTestId('catalog-list')).toContainText('Sold out');
  });

  test('forces sold-out state across catalog without changing app code', async ({ page }) => {
    await page.route('**/api/products', async (route) => {
      const response = await route.fetch();
      const payload = (await response.json()) as {
        products: Array<{ id: string; title: string; price: number; inStock: boolean }>;
      };

      payload.products = payload.products.map((product) => ({ ...product, inStock: false }));

      await route.fulfill({ response, json: payload });
    });

    await page.goto('/response-surgery');

    await expect(page.locator('.stock-out')).toHaveCount(3);
    await expect(page.locator('.stock-ok')).toHaveCount(0);
  });
});
