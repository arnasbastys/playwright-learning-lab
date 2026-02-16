# Interception Topic

This topic is about forcing weird network behavior on purpose, so UI error states can be tested without waiting for a real backend to misbehave.

## Why this topic matters

Interception is great for testing unhappy paths without setup drama:

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
