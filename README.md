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

Add new topics as sibling folders, for example `topics/fixtures`, `topics/auth`, `topics/har-replay`.

## Setup

```bash
yarn install
npx playwright install chromium
```

## Run

```bash
yarn test:interception
```

## Useful scripts

- `yarn test`: run all topics
- `yarn test:interception`: run only interception topic
- `yarn test:ui`: open Playwright UI mode
- `yarn test:headed`: run headed Chromium for visual debugging
