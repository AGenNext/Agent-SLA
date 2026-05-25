# Production Hardening

Agent-SLA is production-hardened as a stateless contract and facade layer. It
does not replace Agent-Backend for database, runtime state, identity, audit,
alerts, incidents, or SurrealDB persistence.

## API Runtime

The API server includes:

- `/health` liveness endpoint.
- `/ready` readiness endpoint.
- Configurable bind host through `HOST`.
- Configurable port through `PORT`.
- Request body limit through `MAX_BODY_BYTES`, defaulting to 1 MiB.
- Request, header, and keep-alive timeouts through `REQUEST_TIMEOUT_MS`,
  `HEADERS_TIMEOUT_MS`, and `KEEP_ALIVE_TIMEOUT_MS`.
- Graceful shutdown on `SIGTERM` and `SIGINT`.
- JSON-only responses with production security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `Cache-Control: no-store`

## Containers

The API and MCP containers:

- run as the non-root `node` user;
- copy files with `node:node` ownership;
- use `NODE_ENV=production`;
- keep API runtime configurable with environment variables;
- include an API healthcheck;
- are intended to run read-only with dropped capabilities in Compose.

Compose applies:

- `read_only: true`
- `cap_drop: [ALL]`
- `security_opt: [no-new-privileges:true]`
- API healthcheck against `/health`

## CI Gates

CI verifies:

- TypeScript build and tests.
- Python SDK tests.
- Rust SDK tests.
- npm audit with `--audit-level=high`.
- API E2E smoke test through `npm run e2e`.
- Static security policy evaluation through `npm run security:evaluate`.
- Docker builds for API and MCP images.

## Release Enforcement

Every release tag or published GitHub release runs `.github/workflows/release.yml`.
The release workflow blocks completion unless all gates pass:

- `npm run release:verify`
- Python SDK tests
- Rust SDK tests
- CodeQL JavaScript/TypeScript analysis
- API and MCP Docker image builds
- final `enforce-release` aggregation job

Use the `enforce-release` job as the required status check for protected release
branches/tags.

## Operational Boundary

Use Agent-Backend for:

- tenant state and identity;
- SLA persistence;
- SLI/SLO records;
- error budgets;
- incidents, alerts, postmortems;
- SurrealDB policy and record-level permissions.

Agent-SLA should remain stateless unless wired to Agent-Backend through the
adapter interface documented in `backend-adapter.md`.
