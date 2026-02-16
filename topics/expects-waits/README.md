# Expects + Waits Topic

This module demonstrates how Playwright assertions provide built-in waiting and retry behavior.

## What this covers

- actionability waiting via `toBeEnabled` before click
- auto-retrying DOM assertions with `toHaveText`
- state polling with `expect.poll`
- retriable assertion blocks using `expect(...).toPass()`
- custom matcher extension (`toHaveDataPhase`) for clearer intent

## Why this matters

In real apps, UI and backend state rarely settles instantly. Expressive assertions let tests stay deterministic without manual `waitForTimeout` calls.

## Command

```bash
yarn test:expects-waits
```
