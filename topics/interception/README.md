# Interception Topic

This module explores how Playwright network interception can validate frontend behavior under conditions that are hard to reproduce reliably with a real backend.

## Why this topic matters

Interception lets you test UX for failure paths without unstable environments:

- transient API failures
- rate limiting
- malformed payloads
- hard network drops

## Covered scenarios

- 200 success via `route.fulfill`
- 500 server error via `route.fulfill`
- 429 rate limit with `retry-after` header
- invalid JSON body parsing failure
- request abort via `route.abort`

## Commands

```bash
yarn test:interception
```

## Suggested next commits

- add latency simulation and loading-state assertions
- add one-time route handling to emulate flaky first attempt
- add fixtures that centralize common route mocks
