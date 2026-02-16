# Playwright Learning Lab

Portfolio-friendly Playwright workspace organized by topic. Each topic has its own app surface and focused test suite so you can grow this repo over time.

## Stack

- Yarn
- Playwright Test
- TypeScript
- Minimal Node server for local deterministic UI fixtures

## Repo shape

- `topics/`
- `topics/interception/app/`: tiny checkout UI used to explore route interception patterns
- `topics/interception/tests/`: specs for success, API errors, malformed payloads, and network failures
- `topics/expects-waits/app/`: async UI playground for assertion-driven waiting
- `topics/expects-waits/tests/`: specs for auto-waiting, `expect.poll`, `toPass`, and custom matcher extension

Add new topics as sibling folders, for example `topics/fixtures`, `topics/auth`, `topics/har-replay`.

## Setup

```bash
yarn install
npx playwright install chromium
```

## Run

```bash
yarn test:interception
yarn test:expects-waits
```

## Useful scripts

- `yarn test`: run all topics
- `yarn test:interception`: run only interception topic
- `yarn test:expects-waits`: run only expects + waits topic
- `yarn test:ui`: open Playwright UI mode
- `yarn test:headed`: run headed Chromium for visual debugging
