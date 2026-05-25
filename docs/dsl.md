# AgentSLA DSL

AgentSLA uses JSON as its concrete syntax so agreements can move through agent
protocols and APIs without a custom parser.

## Root Collections

- `GuaranteeTerm`: required list of guarantee terms.
- `QoSMetric`: base metrics.
- `DerivedQoSMetric`: metrics aggregated over a window.
- `QoSDriftMetric`: drift metrics comparing adjacent derived windows.
- `Provider`: metric providers.
- `Agent`: scoped AI agents.
- `ModelCard`: model metadata referenced by agents.

## Minimal Example

See `examples/listing1.json` for the paper-inspired golden fixture. It defines:

- one guarantee term
- one agent scope
- one SLO comparing `AVG TTFT < 1`
- one derived TTFT metric over the last ten messages
- one provider, agent, and model card

## Validation Rules

- Metric references used in SLO comparisons must resolve.
- Scope agent references must resolve.
- Agent model card references must resolve when present.
- Metric provider references must resolve when present.
- Provider confidence must be between `0` and `1`.
- Metric type, operator, aggregation, and window unit must be known values.
- Metric units are required for metric definitions.

Validation is implemented in `packages/core/src/validator.ts` and mirrored in
the Python and Rust SDKs.

## Expression Types

- `Comparison`: compares a metric to a threshold.
- `And`: every child expression must pass.
- `Or`: at least one child expression must pass.

The implementation also accepts normalized uppercase forms:
`COMPARISON`, `AND`, and `OR`.

## Operators

- `LESS`
- `LESS_OR_EQUAL`
- `EQUAL`
- `GREATER_OR_EQUAL`
- `GREATER`

## Derived Metrics

`DerivedQoSMetric` adds:

- `window`: numeric window size.
- `window_unit`: `MESSAGE`, `SECOND`, `MINUTE`, `HOUR`, or `DAY`.
- `aggregation`: `AVG`, `MEDIAN`, `MIN`, `MAX`, `SUM`, `COUNT`, `P95`, or
  `P99`.

## Drift Metrics

`QoSDriftMetric` compares two named metrics through `current` and `baseline`
references. It is intended for detecting metric movement across time windows,
not for storing raw observations.
