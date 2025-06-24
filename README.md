# TrailTasks Monorepo

This repository contains all components of **TrailTasks**:

- **mobile-client** – React Native application.
- **api-server** – Express.js + PostgreSQL API server.
- **websockets-server** – Go WebSocket server for group sessions.

The project is now a monorepo so tests can run against both the API and WebSocket servers locally.

## Starting the Servers for Tests

Install root dependencies once:

```bash
npm install
```

Then start both servers concurrently from the repository root:

```bash
npm run test-server
```

This runs `npm run start:test` inside `api-server` and `go run ./cmd/server` inside `websockets-server`.

## Running Client Tests

In a separate terminal, with the servers running, execute the mobile client test suite:

```bash
cd mobile-client
npm test
```

## Repository Structure

```
api-server/         Node.js API service
websockets-server/  Go WebSocket server
mobile-client/      React Native application
```

Refer to the individual READMEs in each directory for more details.

