# Agent-SLA

Agent-SLA is a composable implementation of the AgentSLA DSL described in
`2511.02885v1.pdf`: a JSON-based service level agreement model for AI agents.

This repository owns the SLA product surface:

- Canonical TypeScript schema and validator
- JavaScript, Python, and Rust SDKs
- HTTP API facade
- MCP stdio server
- Codex skill for drafting and reviewing AgentSLA agreements
- Docker containers for API and MCP runtime entrypoints
- GitHub Pages landing page with docs and artifact links
- Next.js static-export website for blogs, whitepaper, API/MCP references, glossary, FAQ, knowledge graph, and lead generation
- Production hardening for API request handling, container defaults, and CI gates
- E2E and security evaluation enforcement on every release

`Agent-Backend` is the database and runtime layer. Agent-SLA integrates with it
through explicit adapter interfaces instead of owning persistence or runtime
coordination directly.

## Current Status

- The canonical metric registry covers the AgentSLA paper's Table 2 metric list.
- TypeScript is the canonical implementation for schema, parser, validation,
  evaluation, and explanation.
- Python and Rust mirror the validator/evaluator contract.
- The API and MCP server are stateless facades over the core contract.
- JSON Schema is exported from the core and JS SDK and available through the
  API/MCP surfaces.
- Runtime persistence, metric history, incidents, SLI/SLO records, and live
  SurrealDB state belong to `AGenNext/Agent-Backend`.

## Layout

```text
packages/core        Canonical TypeScript model, parser, validator, evaluator
packages/sdk-js      JavaScript/TypeScript SDK re-exporting the core contract
packages/sdk-python  Python SDK mirror
packages/sdk-rust    Rust SDK mirror
apps/api             HTTP API facade
apps/mcp-server      MCP stdio server
skills/agent-sla     Codex skill
docs                 Product, DSL, API, MCP, SDK, and design docs
examples             Golden AgentSLA examples
```

## Quick Start

```bash
npm install
npm test

PYTHONPATH=packages/sdk-python python3 -m unittest discover packages/sdk-python/tests
cargo test --manifest-path packages/sdk-rust/Cargo.toml
```

Validate the golden paper-inspired SLA:

```bash
npm run build --workspace @agennext/agent-sla-core
npm run build --workspace @agennext/agent-sla-api
node apps/api/dist/src/server.js
curl -s http://127.0.0.1:8080/v1/quality-model
```

Container smoke test:

```bash
docker compose up --build
curl -s http://127.0.0.1:8080/v1/schema
```

Release gate:

```bash
npm run release:verify
```

GitHub Pages source:

```text
apps/site
```

## Example Usage

JavaScript:

```js
import { validateSLA, evaluateSLA } from "@agennext/agent-sla-sdk-js";
import sla from "./examples/listing1.json" with { type: "json" };

console.log(validateSLA(sla));
console.log(evaluateSLA(sla, { "AVG TTFT": 0.5 }));
```

Python:

```python
from agent_sla import validate_sla, evaluate_sla

result = validate_sla(sla)
evaluation = evaluate_sla(sla, {"AVG TTFT": 0.5})
```

Rust:

```rust
let sla = agent_sla::parse_sla(json_text)?;
let errors = agent_sla::validate_sla(&sla);
```

## Evidence

- Source paper: `2511.02885v1.pdf`
- Golden example: `examples/listing1.json`
- Landing page: `docs/index.html`
- Next.js site: `apps/site`
- Container docs: `docs/container.md`
- Production hardening: `docs/production.md`
- Release workflow: `.github/workflows/release.yml`
- Plan source: AgentSLA JSON DSL, quality model, validating parser, and metric
  rules described in the paper.
- Runtime boundary: `Agent-Backend` owns DB/runtime integration; current local
  evidence is `/Users/apple/Agent-Backend/surreal/schema/0045_slo_incident_alerting_functions.surql`.

## GitHub Packages

Publishable JavaScript packages use the `@agennext` scope and GitHub Packages registry:

- `@agennext/agent-sla-core`
- `@agennext/agent-sla-sdk-js`
- `@agennext/agent-sla-api`
- `@agennext/agent-sla-mcp-server`

Authenticate with a GitHub token that has `write:packages`, then publish from the workspaces:

```bash
npm publish --workspace packages/core
npm publish --workspace packages/sdk-js
npm publish --workspace apps/api
npm publish --workspace apps/mcp-server
```
