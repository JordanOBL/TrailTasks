# Trail Tasks API server

This package is the Node.js/Express API for Trail Tasks account/catalog sync and authentication work. The solo mobile MVP should not require this server to be running, but API-backed sync/auth tickets should use this package.

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL for local API/database work

## Install

From this directory:

```sh
npm install
```

Or from the repo root:

```sh
npm install --prefix api-server
```

## Environment

The server loads configuration through dotenv/environment variables. Use local development or test credentials only. Do not point local tests at production data.

Common values include database connection settings and API URLs used by the mobile sync flow. Check existing `.env*` files or deployment config for the current names before adding new variables.

## Run locally

```sh
npm run start:dev
```

For test-mode development:

```sh
npm run start:test
```

## Tests

```sh
npm test
```

The API test suite uses Node's built-in `node:test` runner. It does not require Jest.

Current tests cover password hashing/redaction helpers used by auth and sync safety. Add focused Node tests near the helper or route being changed.

## Build

```sh
npm run build
npm run start:prod
```

`npm run build` transpiles `src/` into `dist/` and renames the entrypoint for production startup.

## MVP boundary

The current Trail Tasks MVP is the mobile offline solo loop. API work should be limited to tickets that explicitly involve auth, sync, or server-backed behavior. Group-session/WebSocket protocol work is deferred and belongs in a separate follow-up scope.
