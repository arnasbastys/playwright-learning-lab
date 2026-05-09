# Fixtures Scope Topic

This topic explores how Playwright fixtures model setup ownership and lifetime.

## What this covers

- test-scoped fixtures: create data for one test and tear it down right after `use()` completes
- worker-scoped fixtures: provision one expensive resource per worker process with `{ scope: 'worker' }`
- automatic fixtures: make fixture setup run even when a test does not explicitly request it
- suite-scoped options: use `test.use()` to override a typed option fixture for a `describe` block
- "global" hooks: model global `beforeEach`/`afterEach` with automatic test fixtures, and global `beforeAll`/`afterAll` with automatic worker fixtures

## Why this matters

Fixtures are more explicit than shared hooks because the scope is declared next to setup and cleanup.
Use test scope for cheap per-test isolation, worker scope for expensive resources that can safely be shared by tests in the same worker, and Playwright project dependencies or `globalSetup` only for true whole-run setup.

## Scope decision guide

| Case | Pattern in this topic | Use when |
| --- | --- | --- |
| Per-test data | `noteBoard` fixture with default scope | The test mutates data and needs cleanup immediately after the test. |
| Per-worker resource | `workerTenant` with `{ scope: 'worker' }` | Setup is expensive but safe to share across tests in the same worker process. |
| Global before/after each | `auditTrail` with `{ auto: true }` | Every test importing this custom `test` object needs the same lightweight wrapper. |
| Global before/after all per worker | `workerTenant` with `{ scope: 'worker', auto: true }` | Every worker should provision and tear down shared state without each test asking for it. |
| Suite-specific configuration | `fixtureProfile` overridden by `test.use()` | One `describe` block needs a different typed option value. |

Notes from the Playwright docs:

- Fixtures are isolated, on-demand, composable setup units.
- Worker-scoped fixtures are created once per worker process, not once for the entire run.
- If setup must truly happen before all tests, Playwright recommends project dependencies because they appear in reports, support traces, and can use fixtures. `globalSetup` exists, but is more manual.

Reference: [Playwright fixtures](https://playwright.dev/docs/test-fixtures) and [global setup/teardown](https://playwright.dev/docs/test-global-setup-teardown).

## Files to read

- `tests/fixtures.ts`: the custom `test` object and scoped fixtures
- `tests/fixtures-scope.spec.ts`: assertions that consume the scoped fixtures
- `tests/fixtures-worker-parallel.spec.ts`: a second file so worker fixtures can be observed with multiple workers

## Command

```bash
yarn test:fixtures
```

For a more visible worker-scope demo, keep the script's `--workers=2` flag and watch the list reporter show files running in separate worker processes when available.
