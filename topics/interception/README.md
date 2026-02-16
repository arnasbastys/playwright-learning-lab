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
- response surgery via `route.fetch()` + selective payload mutation

## Response surgery sub-case

The advanced set lives in `response-surgery.spec.ts` and demonstrates:

- mutating only one field from a real backend payload
- injecting schema drift to test corruption fallback UI
- adding synthetic records without replacing the whole endpoint
- forcing sold-out state across catalog in one interception

## Commands

```bash
yarn test:interception
```
