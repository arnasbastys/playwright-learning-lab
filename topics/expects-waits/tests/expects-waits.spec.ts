import { test } from '@playwright/test';
import { expect } from './expect-extensions';

test.describe('expects and waits topic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/expects-waits');
  });

  test('auto-waits for actionability before clicking', async ({ page }) => {
    const delayedButton = page.getByRole('button', { name: 'Run delayed action' });

    await expect(delayedButton).toBeEnabled();
    await delayedButton.click();

    await expect(page.getByTestId('delayed-result')).toHaveText(
      'Action completed after control became actionable.'
    );
  });

  test('auto-retries text expectations until async sync finishes', async ({ page }) => {
    await expect(page.getByTestId('sync-status')).toHaveText('Synced 24 records', { timeout: 5_000 });
  });

  test('expect.poll can track browser-side state over time', async ({ page }) => {
    await expect
      .poll(
        async () => {
          return await page.evaluate(() => (window as Window & { __jobProgress: number }).__jobProgress);
        },
        {
          message: 'background progress should eventually reach 100%',
          intervals: [200, 300, 600],
          timeout: 5_000
        }
      )
      .toBe(100);

    await expect(page.getByTestId('job-progress')).toHaveText('100%');
  });

  test('async matchers retry until phase and list settle', async ({ page }) => {
    await expect(page.getByTestId('event-phase')).toHaveText('phase: ready');
    await expect(page.locator('[data-testid="event-feed"] li')).toHaveCount(3);
    await expect(page.locator('[data-testid="event-feed"] li').nth(2)).toHaveText('event-3');
  });

  test('custom matcher can express domain intent for attribute-based states', async ({ page }) => {
    const panel = page.getByTestId('save-panel');

    await page.getByRole('button', { name: 'Start background save' }).click();
    await expect(panel).toHaveDataPhase('done', { timeout: 6_000 });
  });

  test('expect.toPass retries full assertion blocks for eventual consistency', async ({ page }) => {
    await page.getByRole('button', { name: 'Start background save' }).click();

    await expect(async () => {
      await expect(page.getByTestId('save-panel')).toHaveDataPhase('done');
      await expect(page.getByTestId('save-text')).toHaveText('Saved successfully');
    }).toPass({ intervals: [250, 500, 1_000], timeout: 7_000 });
  });
});
