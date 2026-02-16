import { test, expect } from '@playwright/test';

test.describe('APIRequestContext integration topic', () => {
  test.beforeEach(async ({ request }) => {
    const resetResponse = await request.post('/api/test-data/reset');
    expect(resetResponse.ok()).toBeTruthy();
  });

  test.afterEach(async ({ request }) => {
    const resetResponse = await request.post('/api/test-data/reset');
    expect(resetResponse.ok()).toBeTruthy();
  });

  test('seeds data via HTTP before opening UI', async ({ page, request }) => {
    const seededItems = [
      { title: 'Backfill invoices', status: 'pending' },
      { title: 'Publish release notes', status: 'done' }
    ];

    for (const item of seededItems) {
      const seedResponse = await request.post('/api/lab-items', { data: item });
      expect(seedResponse.ok()).toBeTruthy();
    }

    await page.goto('/api-context');

    await expect(page.getByTestId('item-count')).toHaveText('2 item(s)');
    await expect(page.getByTestId('item-list')).toContainText('Backfill invoices (pending)');
    await expect(page.getByTestId('item-list')).toContainText('Publish release notes (done)');
  });

  test('cleans up a specific seeded record through API and verifies UI', async ({ page, request }) => {
    const createA = await request.post('/api/lab-items', {
      data: { title: 'Nightly import', status: 'pending' }
    });
    const createB = await request.post('/api/lab-items', {
      data: { title: 'Rotate signing key', status: 'done' }
    });

    expect(createA.ok()).toBeTruthy();
    expect(createB.ok()).toBeTruthy();

    const createdItemA = (await createA.json()).item as { id: number };
    const deleteResponse = await request.delete(`/api/lab-items/${createdItemA.id}`);
    expect(deleteResponse.ok()).toBeTruthy();

    await page.goto('/api-context');

    await expect(page.getByTestId('item-count')).toHaveText('1 item(s)');
    await expect(page.getByTestId('item-list')).not.toContainText('Nightly import (pending)');
    await expect(page.getByTestId('item-list')).toContainText('Rotate signing key (done)');
  });
});
