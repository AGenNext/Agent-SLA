# HTTP API

The API is a lightweight facade over the core AgentSLA contract. It does not own
database or runtime state; production persistence should be wired through
Agent-Backend.

## Endpoints

- `POST /v1/sla/validate`
- `POST /v1/sla/parse`
- `POST /v1/sla/evaluate`
- `POST /v1/sla/explain`
- `GET /v1/quality-model`
- `GET /v1/schema`
- `GET /v1/metrics`
- `POST /v1/metrics`

## Running Locally

```bash
npm install
npm run build --workspace @agent-sla/api
node apps/api/dist/src/server.js
```

Default URL:

```text
http://127.0.0.1:8080
```

## Validate

```bash
curl -s \
  -H "content-type: application/json" \
  --data @examples/listing1.json \
  http://127.0.0.1:8080/v1/sla/validate
```

## Response Shape

Validation responses return:

```json
{
  "valid": true,
  "errors": []
}
```

Errors include:

```json
{
  "code": "UNKNOWN_OPERATOR",
  "path": "GuaranteeTerm[0].SLO[0].BoolExpression",
  "message": "Unknown operator: BELOW"
}
```

## Evaluate

```bash
curl -s \
  -H "content-type: application/json" \
  --data '{"sla": {"GuaranteeTerm": []}, "metrics": {"AVG TTFT": 0.5}}' \
  http://127.0.0.1:8080/v1/sla/evaluate
```

Real callers should send a complete AgentSLA object and a metric snapshot keyed
by the metric names referenced in SLO comparisons.

## Quality Model

`GET /v1/quality-model` returns:

- `metricTypes`: accepted metric identifiers.
- `metricCatalog`: metric identifier, quality characteristic, and description.
- `operators`: supported comparison operators.
- `aggregations`: supported derived metric aggregations.
- `windowUnits`: supported derived metric window units.
- `backendRuntime`: evidence for Agent-Backend runtime mapping.

## JSON Schema

`GET /v1/schema` returns the AgentSLA JSON Schema exported by
`packages/core/src/json-schema.ts`. Use it for editor integration, request
validation, and SDK generation. Runtime semantic checks still require
`POST /v1/sla/validate` because reference integrity, provider confidence, and
metric catalog checks are semantic rules beyond structural JSON shape.

## Runtime Boundary

The API keeps registered metrics in memory for local development only. Durable
SLA documents, metric history, SLI/SLO records, error budgets, alerts, and
incidents should be persisted through Agent-Backend.
