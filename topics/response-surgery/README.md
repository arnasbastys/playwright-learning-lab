# Response Surgery Topic

This one uses an overlooked Playwright pattern:

- call the real endpoint with `route.fetch()`
- edit selected response fields
- fulfill with mutated JSON via `route.fulfill({ response, json })`

So you keep realistic backend payloads, but still test weird edge cases without asking backend teammates for custom fixtures.

## Included chaos

- force a ridiculous discount (`$49 -> $0.99`)
- inject schema drift to trigger corruption fallback
- add a ghost product visible only in tests
- flip all products to sold-out in one interception

## Command

```bash
yarn test:response-surgery
```
