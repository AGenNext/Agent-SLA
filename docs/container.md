# Containers

Agent-SLA ships two container entrypoints:

- API facade: `Dockerfile`
- MCP stdio server: `Dockerfile.mcp`

The containers are stateless. Durable SLA storage, runtime metric history,
incidents, alerts, and SurrealDB state belong to Agent-Backend.

Production defaults:

- API container binds `HOST=0.0.0.0` and `PORT=8080`.
- Both containers run as the non-root `node` user.
- Compose runs containers read-only, drops Linux capabilities, and enables
  `no-new-privileges`.
- The API image and Compose service include a `/health` healthcheck.

## API Image

Build:

```bash
docker build -t agennext/agent-sla-api:latest .
```

Run:

```bash
docker run --rm -p 8080:8080 agennext/agent-sla-api:latest
```

Smoke test:

```bash
curl -s http://127.0.0.1:8080/v1/quality-model
curl -s http://127.0.0.1:8080/v1/schema
```

## MCP Image

Build:

```bash
docker build -f Dockerfile.mcp -t agennext/agent-sla-mcp:latest .
```

Run:

```bash
docker run --rm -i agennext/agent-sla-mcp:latest
```

List tools:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

## Compose

```bash
docker compose up --build
```

The API is available at `http://127.0.0.1:8080`.
