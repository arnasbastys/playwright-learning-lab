# Playwright Learning Lab

Small Playwright playground split by topic. Each topic has its own tiny app and tests, so I can poke one idea at a time without turning this repo into spaghetti.

## Stack

- Yarn
- Playwright Test
- TypeScript
- Minimal Node server for local deterministic UI fixtures

## Repo shape

- `topics/`
- `topics/interception/app/`: fake checkout UI for request mocking and failure states
- `topics/interception/tests/`: interception cases (success, API errors, malformed payloads, hard network fail)
- `topics/expects-waits/app/`: async UI playground for matcher-driven waiting
- `topics/expects-waits/tests/`: waits/assertions (`toHaveText`, `expect.poll`, `toPass`, custom matcher)
- `topics/api-request-context/app/`: minimal list UI backed by server state
- `topics/api-request-context/tests/`: seed/cleanup data via API before UI assertions
- `topics/response-surgery/app/`: catalog UI fed by real API payloads
- `topics/response-surgery/tests/`: `route.fetch()` + payload mutation edge-case testing

More topics can be added as siblings, for example `topics/fixtures`, `topics/auth`, `topics/har-replay`.

## Setup

```bash
yarn install
npx playwright install chromium
```

## Run

```bash
yarn test:interception
yarn test:expects-waits
yarn test:api-request-context
yarn test:response-surgery
```

## Useful scripts

- `yarn test`: run all topics
- `yarn test:interception`: run only interception topic
- `yarn test:expects-waits`: run only expects + waits topic
- `yarn test:api-request-context`: run APIRequestContext seed/cleanup topic
- `yarn test:response-surgery`: run response mutation topic
- `yarn test:ui`: open Playwright UI mode
- `yarn test:headed`: run headed Chromium for visual debugging
