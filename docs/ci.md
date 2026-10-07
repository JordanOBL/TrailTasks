# CI quality gates

Trail Tasks uses GitHub Actions to run the practical MVP release checks on pull requests and pushes to the integration branch.

## Workflow

`.github/workflows/quality.yml` runs two jobs:

1. API tests
   - installs `api-server` dependencies with `npm ci --prefix ./api-server`
   - runs `npm --prefix ./api-server test`

2. Mobile release gate
   - installs `mobile-client` dependencies with `npm ci --prefix ./mobile-client`
   - runs `npm --prefix ./mobile-client run quality:release`

`quality:release` is the current MVP gate. It runs the scoped release TypeScript check and the focused unit suite. The full mobile typecheck still has deferred post-MVP debt in Friends, GroupSession, WebSockets, and TrailQueue areas; keep that cleanup separate from the release gate unless those surfaces become MVP scope.

## What CI does not do yet

This first pass intentionally avoids simulator/device builds, signing, deploys, or production secrets. Those belong in later tickets after the PR quality gate is stable.

Future CI/CD additions should include:

- Android release build/signing checks
- iOS build/signing checks
- API deploy workflow
- Postgres migration checks before deploy
- backup/restore verification for user data safety
