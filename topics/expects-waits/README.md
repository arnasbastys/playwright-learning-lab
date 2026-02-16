# Expects + Waits Topic

This topic shows the nice part of Playwright assertions: they wait and retry for you, so tests read like intent instead of timer choreography.

## What this covers

- actionability waiting via `toBeEnabled` before click
- auto-retrying DOM assertions with `toHaveText`
- state polling with `expect.poll`
- retriable assertion blocks using `expect(...).toPass()`
- custom matcher extension (`toHaveDataPhase`) for clearer intent

## Why this matters

Real apps are async by default. Good assertions keep tests stable without sprinkling `waitForTimeout` everywhere and hoping for the best.

## Command

```bash
yarn test:expects-waits
```
