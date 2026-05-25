# MCP Server

`apps/mcp-server` exposes AgentSLA operations over MCP-compatible stdio JSON-RPC.

## Tools

- `validate_agent_sla`
- `explain_agent_sla`
- `draft_agent_sla`
- `evaluate_agent_sla`
- `list_quality_model`
- `get_agent_sla_json_schema`
- `suggest_slo_metrics`

## Build

```bash
npm install
npm run build --workspace @agent-sla/mcp-server
```

Run over stdio:

```bash
node apps/mcp-server/dist/src/server.js
```

Container:

```bash
docker build -f Dockerfile.mcp -t agennext/agent-sla-mcp:latest .
docker run --rm -i agennext/agent-sla-mcp:latest
```

## JSON-RPC Shape

List tools:

```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

Call validation:

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "validate_agent_sla",
    "arguments": {
      "sla": {}
    }
  }
}
```

`draft_agent_sla` returns a minimal TTFT agreement that callers should customize
with real agent, model card, provider, metric source, and evidence.

`get_agent_sla_json_schema` returns the same JSON Schema exported by
`packages/core/src/json-schema.ts`.

The server intentionally keeps persistence out of scope. Runtime state and DB
integration belong behind the Agent-Backend adapter boundary.
