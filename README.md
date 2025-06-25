# TrailTasks Monorepo

This repository contains all services for the TrailTasks application. The project is split into three packages:

- **api-server** – Node.js Express server with a PostgreSQL database.
- **mobile-client** – React Native client application.
- **websockets-server** – Go server providing real-time group session capabilities.

## Getting Started

Clone the repo and install dependencies for each package:

```bash
# install root utilities
npm install

# install package dependencies
npm install --prefix api-server
npm install --prefix mobile-client
```

The Go server requires Go 1.23 or newer and its modules can be downloaded with:

```bash
cd websockets-server
go mod download
```

## Running the Services

Scripts are defined in the root `package.json` to help start each piece individually or together:

```bash
# start only the API server
npm run start:api:dev

# start only the WebSocket server
npm run start:ws

# start the mobile app on Android
npm run start:android:dev

# start API and WebSocket servers together
npm run start:servers:dev
```

## Tests

Individual test suites can be run with:

```bash
npm run test:api        # Express server tests
npm run test:mobile     # React Native tests
npm run test:ws         # Go tests
```

Note that some tests rely on native tooling or database configuration and may fail without the proper environment.

## Repository Layout

- `api-server/` – Express server source code.
- `mobile-client/` – React Native application.
- `websockets-server/` – Go WebSocket server.

Each package contains its own README with more details.
