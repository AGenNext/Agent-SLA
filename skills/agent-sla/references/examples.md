# AgentSLA Examples

Minimal TTFT SLO:

```json
{
  "GuaranteeTerm": [
    {
      "Scope": [{ "name": "Default Scope", "Agent": "Agent 1" }],
      "QualifyingCondition": [],
      "SLO": [
        {
          "name": "TTFT under one second",
          "BoolExpression": {
            "type": "Comparison",
            "QoSMetric": "AVG TTFT",
            "operator": "LESS",
            "value": 1
          }
        }
      ]
    }
  ],
  "DerivedQoSMetric": [
    {
      "name": "AVG TTFT",
      "description": "Average time to first token across the last ten messages.",
      "metric_type": "TTFT",
      "unit": "sec",
      "uncertainty": 0,
      "window": 10,
      "window_unit": "MESSAGE",
      "aggregation": "AVG",
      "Provider": "Provider 1"
    }
  ],
  "Provider": [{ "name": "Provider 1", "confidence": 0.95, "reputation": 50 }],
  "Agent": [{ "name": "Agent 1", "ModelCard": "Model 1" }],
  "ModelCard": [{ "name": "Model 1", "model_card": "" }]
}
```
