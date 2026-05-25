# Quality Model

The v1 quality model follows the AgentSLA paper's ISO/IEC 25010 extension
direction and keeps the metric registry extensible.

The canonical registry is `METRIC_TYPES` in
`packages/core/src/types.ts`. Python and Rust mirrors must stay aligned with
that list. Regression tests in all three SDKs assert Table 2 coverage.

## Naming Policy

Metric identifiers use uppercase snake case for code stability:

- Paper names such as `F1 Score` become `F1_SCORE`.
- Paper names such as `XAccuDiff` become `XACCU_DIFF`.
- Paper names such as `EnergyConsumption` become `ENERGY_CONSUMPTION`.
- `E2E` is the canonical end-to-end response time metric.
- `E2E_LATENCY` remains accepted as a compatibility alias for earlier examples.

## Table 2 Metric Types

- `PRECISION`: Functional completeness; true positive over predicted positive.
- `RECALL`: Functional completeness; true positive over actual positive.
- `ACCURACY`: Functional correctness; percentage of correct predictions.
- `AUC`: Functional correctness; probability a positive example is ranked above
  a negative example.
- `F1_SCORE`: Functional completeness; harmonic mean of precision and recall.
- `XACCU_DIFF`: Functional appropriateness; train/test accuracy difference.
- `PMV`: Functional appropriateness; accuracy decrease against noisy-data model.
- `TRAINING_TIME`: Functional appropriateness and time-behavior; training time.
- `POINTWISE_ROBUSTNESS`: User error protection; minimum input change affecting
  model prediction.
- `ADVERSARIAL_FREQUENCY`: User error protection; input change impact frequency.
- `ADVERSARIAL_SEVERITY`: Fault-tolerance; distance to nearest adversarial
  example.
- `ADVERSARIAL_DISTANCE`: Fault-tolerance; adversarial severity on training
  input.
- `TTFT`: Time-behavior; time to first token.
- `E2E`: Time-behavior; end-to-end response time.
- `BIAS`: Fairness; ratio of successful bias tests passed.
- `RACISM`: Fairness; ratio for racism tests.
- `SEXISM`: Fairness; ratio for sexism tests.
- `AGEISM`: Fairness; ratio for ageism tests.
- `RELIGIOUS`: Fairness; ratio for religious bias tests.
- `POLITICAL`: Fairness; ratio for political bias tests.
- `XENOPHOBIA`: Fairness; ratio for xenophobia tests.
- `SHAP`: Interpretability; SHAP estimation error.
- `LIME`: Interpretability; comparison to interpretable local surrogates.
- `ENERGY_CONSUMPTION`: Training/inference impact; estimated energy consumption.
- `WATER_CONSUMPTION`: Training/inference impact; estimated water consumption.
- `CARBON_EMISSIONS`: Training/inference impact; estimated carbon emissions.
- `CARBON_OFFSET`: Mitigation; percentage offset through carbon credits.
- `OUTPUT_SIZE`: Conciseness; generated output length.
- `A2A`: Interoperability; 0 if unsupported, 1 if supported.
- `MCP`: Interoperability; 0 if unsupported, 1 if supported.
- `OVERSIGHT_LEVEL`: Autonomy; level of human oversight.

## Measurement Notes

- Ratio metrics should use `unit: "ratio"` and thresholds in `[0, 1]` unless a
  provider defines a different scale.
- Latency and training time metrics should use explicit time units such as
  `sec`, `ms`, or `min`.
- `A2A` and `MCP` are binary interoperability metrics: `0` unsupported, `1`
  supported.
- Fairness and bias metrics must attach the test suite or benchmark provider as
  evidence.
- Sustainability metrics must attach the estimation method or measurement
  provider; do not mix training and inference measurements without naming scope.
