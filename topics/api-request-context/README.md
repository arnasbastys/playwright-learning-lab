# APIRequestContext Topic

This topic demonstrates the API-first test setup pattern:

- use `request` (Playwright `APIRequestContext`) to seed records over HTTP
- open the page after seeding, so UI assertions focus only on rendering
- clean state through API calls to avoid brittle UI-only setup chains

## Why this pattern is handy

If creating test data requires several clicks, your tests become slower and more fragile. API setup keeps tests short and deterministic.

## Command

```bash
yarn test:api-request-context
```
