import type { BrowserContext } from '@playwright/test';

export async function applyVilniusGeoPreset(context: BrowserContext): Promise<void> {
  await context.setGeolocation({ latitude: 54.6872, longitude: 25.2797 });
  await context.grantPermissions(['geolocation']);
}

export async function applySanFranciscoGeoPreset(context: BrowserContext): Promise<void> {
  await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
  await context.grantPermissions(['geolocation']);
}

export async function denyGeolocation(context: BrowserContext): Promise<void> {
  await context.clearPermissions();
}
