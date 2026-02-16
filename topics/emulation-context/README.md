# Emulation Context Topic

A practical tour of Playwright context emulation features that get heavy use in real projects.

## Most-used use cases

- geolocation-based content (delivery zone, nearest store, region-specific results)
- permission-denied fallbacks (location blocked by user)
- locale/timezone rendering differences (format bugs across regions)
- mobile/touch profile behavior (responsive + input mode differences)
- offline/network adversity checks (retry and degraded UX paths)

## What the tests demonstrate

- geolocation + permissions in a reusable preset helper
- locale/timezone overrides reflected in UI
- mobile touch emulation via per-suite `test.use`
- offline failure handling after an initially successful request

## Command

```bash
yarn test:emulation-context
```
