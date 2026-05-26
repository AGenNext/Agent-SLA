# Agent-Backend Integration Contract

Agent-SLA is the stateless contract, SDK, validation, evaluation, and API facade layer. Agent-Backend is the authoritative runtime control plane.

## Ownership Boundary

| Capability | Agent-SLA | Agent-Backend |
| --- | --- | --- |
| SLA schema and DSL | owner | consumer |
| SLA validation | owner | caller |
| SLA evaluation helpers | owner | caller |
| API facade | owner | optional caller/proxy |
| Tenant identity | no | owner |
| Authorization policy | no | owner |
| Persistent SLA objects | no | owner |
| Audit events | emits/forwards | owner |
| Incident state | no | owner |
| Alert state | no | owner |
| Distributed metric registry | no | owner |
| Distributed rate limiting | no | owner/gateway |
| SurrealDB persistence | no | owner |

## Integration Pattern

Use Agent-SLA as a library and/or stateless sidecar. Agent-Backend should import the SDK/core packages or call the Agent-SLA API for validation and evaluation, then persist authoritative state in its own storage.

Recommended flow:

1. Agent-Backend authenticates tenant/user/service principal.
2. Agent-Backend authorizes the requested operation.
3. Agent-Backend calls Agent-SLA validation/evaluation.
4. Agent-Backend persists SLA object, audit event, metric registration, incident state, or alert state.
5. Agent-Backend emits operational events and exposes tenant-scoped APIs.

## Required Agent-Backend Responsibilities

Agent-Backend must provide:

- tenant-scoped SLA CRUD
- project/workspace ownership
- audit log persistence
- idempotency keys for write operations
- optimistic concurrency or versioning
- distributed metric registry
- incident/alert lifecycle state machine
- durable event stream or outbox
- backup and restore
- SurrealDB schema migrations
- authn/authz integration

## Agent-SLA API Usage from Agent-Backend

Agent-Backend may call Agent-SLA endpoints for stateless operations only:

- `POST /v1/sla/validate`
- `POST /v1/sla/evaluate`
- `GET /health`
- `GET /ready`
- `GET /metrics`

Agent-Backend must not treat Agent-SLA memory as authoritative state.

## Adapter Interface Recommendation

Agent-Backend should expose an adapter that isolates Agent-SLA from persistence details:

```ts
export interface AgentSlaBackendAdapter {
  validateSla(input: unknown): Promise<ValidationResult>;
  evaluateSla(input: unknown): Promise<EvaluationResult>;
  persistSlaObject(command: PersistSlaCommand): Promise<PersistedSlaObject>;
  appendAuditEvent(event: AuditEvent): Promise<void>;
  registerMetric(command: RegisterMetricCommand): Promise<RegisteredMetric>;
  recordIncidentEvent(event: IncidentEvent): Promise<void>;
}
```

## Event Contract

Agent-Backend should persist or publish events for:

- `sla.created`
- `sla.updated`
- `sla.deleted`
- `sla.validated`
- `sla.evaluated`
- `metric.registered`
- `incident.opened`
- `incident.updated`
- `incident.resolved`
- `alert.triggered`
- `alert.acknowledged`

Every event should include:

- event ID
- tenant ID
- actor ID or service principal
- correlation/request ID
- timestamp
- object version
- source service

## Deployment Topology

Recommended production topology:

```text
client / agent
    -> API gateway / WAF
    -> Agent-Backend
    -> Agent-SLA SDK or Agent-SLA API facade
    -> SurrealDB / event store / audit store
```

Agent-SLA can also run as an internal service behind Agent-Backend, but should not be exposed as the primary public tenant API unless Agent-Backend responsibilities are implemented at the gateway layer.

## Anti-Patterns

Avoid:

- storing production state only inside Agent-SLA process memory
- exposing Agent-SLA directly as a multi-tenant public API
- duplicating tenant auth logic across Agent-SLA and Agent-Backend
- coupling Agent-SLA to SurrealDB-specific schemas
- making Agent-SLA responsible for incident lifecycle ownership

## Release Gate

A production release that depends on persistence or multi-tenant behavior is not complete until the corresponding Agent-Backend integration and conformance tests are implemented.
