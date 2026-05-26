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
- Bearer-token authentication through `AGENT_SLA_API_TOKEN`.
- Stateless in-memory rate limiting through `RATE_LIMIT_WINDOW_MS` and
  `RATE_LIMIT_MAX_REQUESTS`.
- Optional browser access control through `CORS_ALLOW_ORIGIN`.
- Optional trusted reverse-proxy client attribution through
  `TRUSTED_CLIENT_IP_HEADER`.
- Per-request correlation IDs through `X-Request-Id`.
- Graceful shutdown on `SIGTERM` and `SIGINT`.
- JSON-only responses with production security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: no-referrer`
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()`
  - `Cross-Origin-Resource-Policy: same-origin`
  - `Cache-Control: no-store`

## Production Deployment Requirements

For internet-facing production deployments:

- configure `AGENT_SLA_API_TOKEN`;
- terminate TLS at a gateway, ingress, or load balancer;
- use a dedicated API gateway or WAF for global rate limits and IP policy;
- restrict `CORS_ALLOW_ORIGIN` to explicit trusted origins;
- avoid exposing mutable registration endpoints publicly unless backed by
  authenticated persistence through Agent-Backend;
- centralize logs and propagate `X-Request-Id` across services.

The built-in rate limiter is intentionally lightweight and process-local. Use
an external distributed limiter at the edge for multi-instance deployments.

## Supply Chain Security

CI and release workflows enforce:

- CodeQL static analysis.
- Trivy container vulnerability scanning.
- SPDX SBOM generation and artifact upload.
- npm audit enforcement.
- Docker image build verification.

Release pipelines should additionally:

- publish signed container images;
- attach SBOM artifacts to releases;
- maintain immutable release provenance;
- pin deployment manifests to immutable image digests.

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
- Trivy vulnerability scanning.
- SPDX SBOM generation.
- Next.js static site build for the GitHub Pages surface.

## Release Enforcement

Every release tag or published GitHub release runs `.github/workflows/release.yml`.
The release workflow blocks completion unless all gates pass:

- `npm run release:verify`
- Python SDK tests
- Rust SDK tests
- CodeQL JavaScript/TypeScript analysis
- API and MCP Docker image builds
- vulnerability scan enforcement
- SPDX SBOM generation
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
