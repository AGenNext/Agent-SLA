# Agent-Backend Adapter Boundary

Agent-Backend is the DB and runtime owner. Agent-SLA should call it through a
small adapter interface once persistence is needed.

Evidence:

- Repo: `https://github.com/AGenNext/Agent-Backend`
- Local checkout: `/Users/apple/Agent-Backend`
- Runtime schema: `/Users/apple/Agent-Backend/surreal/schema/0045_slo_incident_alerting_functions.surql`
- Existing runtime tables include `service_level_objectives`,
  `service_level_indicators`, `error_budget_snapshots`, `alert_rules`,
  `alert_events`, `incidents`, and `postmortems`.

## Adapter Responsibilities

- Store and retrieve SLA documents.
- Store agent, model card, provider, and metric relationships.
- Persist evaluation and audit events.
- Serve metric snapshots to the evaluator.
- Provide live runtime state when Agent-SLA needs subscriptions.

## Non-Responsibilities

Agent-SLA should not duplicate Agent-Backend runtime orchestration, database
ownership, auth policy storage, or deployment lifecycle.

## TypeScript Interface

The current boundary is declared in `packages/core/src/backend-adapter.ts`:

```ts
interface AgentBackendAdapter {
  saveSLA(tenantId: string, key: string, sla: AgentSLA): Promise<{ id: string }>;
  loadSLA(tenantId: string, key: string): Promise<AgentSLA | undefined>;
  loadMetricSnapshot(tenantId: string, metricNames: string[]): Promise<MetricSnapshot>;
  recordEvaluation(tenantId: string, key: string, result: EvaluationResult): Promise<{ id: string }>;
}
```

## Mapping Direction

- AgentSLA `SLO` maps to backend `service_level_objectives`.
- Evaluated metric snapshots map to backend `service_level_indicators`.
- Evaluation outcomes can create backend `error_budget_snapshots`.
- Failed or burning SLO states should use backend alert and incident functions.
