import { test, expect } from '@playwright/test';
import {
  applySanFranciscoGeoPreset,
  applyVilniusGeoPreset,
  denyGeolocation
} from './context-presets';

test.describe('emulation context topic', () => {
  test('uses geolocation emulation to load Vilnius-specific nearby places', async ({ page, context }) => {
    await applyVilniusGeoPreset(context);

    await page.goto('/emulation-context');
    await page.getByRole('button', { name: 'Use my location' }).click();

    await expect(page.getByTestId('nearby-status')).toHaveText('Region: Vilnius');
    await expect(page.getByTestId('nearby-list')).toContainText('Old Town Coffee');
    await expect(page.getByTestId('nearby-list')).toContainText('Neris Riverside Run Club');
  });

  test('permission denial path stays user-friendly', async ({ page, context }) => {
    await denyGeolocation(context);

    await page.goto('/emulation-context');
    await page.getByRole('button', { name: 'Use my location' }).click();

    await expect(page.getByTestId('nearby-status')).toHaveText('Location permission denied.');
    await expect(page.getByTestId('nearby-list').locator('li')).toHaveCount(0);
  });

  test.describe('locale + timezone emulation', () => {
    test.use({ locale: 'de-DE', timezoneId: 'Europe/Berlin' });

    test('reflects emulated locale and timezone in the UI snapshot', async ({ page }) => {
      await page.goto('/emulation-context');

      await expect(page.getByTestId('locale-value')).toHaveText('de-DE');
      await expect(page.getByTestId('timezone-value')).toHaveText('Europe/Berlin');
      await expect(page.getByTestId('currency-sample')).toContainText('$');
      await expect(page.getByTestId('currency-sample')).toContainText('1.234');
    });
  });

  test.describe('mobile profile emulation', () => {
    test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

    test('switches to touch input profile label', async ({ page }) => {
      await page.goto('/emulation-context');

      await expect(page.getByTestId('input-profile')).toHaveText('Touch-first layout');
    });
  });

  test('offline network emulation shows retry failure after a successful first load', async ({
    page,
    context
  }) => {
    await applySanFranciscoGeoPreset(context);

    await page.goto('/emulation-context');
    await page.getByRole('button', { name: 'Use my location' }).click();

    await expect(page.getByTestId('nearby-status')).toHaveText('Region: San Francisco');

    await context.setOffline(true);
    await page.getByRole('button', { name: 'Refresh nearby' }).click();

    await expect(page.getByTestId('nearby-status')).toHaveText(
      'Network error while loading nearby spots.'
    );

    await context.setOffline(false);
  });
});
