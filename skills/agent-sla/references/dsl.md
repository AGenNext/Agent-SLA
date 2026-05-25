# AgentSLA DSL Reference

Root object keys:

- `GuaranteeTerm`
- `QoSMetric`
- `DerivedQoSMetric`
- `QoSDriftMetric`
- `Provider`
- `Agent`
- `ModelCard`

An SLO uses `BoolExpression`:

```json
{
  "type": "Comparison",
  "QoSMetric": "AVG TTFT",
  "operator": "LESS",
  "value": 1
}
```

Supported junctions:

- `And` / `AND`
- `Or` / `OR`

Validation must reject unresolved references, invalid operators, unknown metric
types, unknown aggregations, unknown window units, missing metric units, and
provider confidence outside `[0, 1]`.
