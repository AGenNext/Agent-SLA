# Quality Model Reference

Table 2 metric types:

- `PRECISION`
- `RECALL`
- `ACCURACY`
- `AUC`
- `F1_SCORE`
- `XACCU_DIFF`
- `PMV`
- `TRAINING_TIME`
- `POINTWISE_ROBUSTNESS`
- `ADVERSARIAL_FREQUENCY`
- `ADVERSARIAL_SEVERITY`
- `ADVERSARIAL_DISTANCE`
- `TTFT`
- `E2E`
- `BIAS`
- `RACISM`
- `SEXISM`
- `AGEISM`
- `RELIGIOUS`
- `POLITICAL`
- `XENOPHOBIA`
- `SHAP`
- `LIME`
- `ENERGY_CONSUMPTION`
- `WATER_CONSUMPTION`
- `CARBON_EMISSIONS`
- `CARBON_OFFSET`
- `OUTPUT_SIZE`
- `A2A`
- `MCP`
- `OVERSIGHT_LEVEL`

Naming policy:

- Use uppercase snake case in JSON.
- Use `F1_SCORE`, not `F1 Score`.
- Use `XACCU_DIFF`, not `XAccuDiff`.
- Use `ENERGY_CONSUMPTION`, `WATER_CONSUMPTION`, and `CARBON_EMISSIONS`.
- Use `E2E` for the paper metric; `E2E_LATENCY` is accepted as a compatibility
  alias in the implementation.

Prefer concrete, measurable SLOs:

- Latency: lower is better.
- Availability and accuracy: higher is better.
- Cost: lower is usually better, but attach product context.
- Safety, privacy, transparency, and fairness require explicit measurement
  definitions and evidence sources.
