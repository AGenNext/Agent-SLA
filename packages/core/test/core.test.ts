import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { evaluateSLA, explainSLA, getAgentSLAJsonSchema, listQualityModel, METRIC_TYPES, parseSLA, validateSLA } from "../src/index.js";

const golden = JSON.parse(readFileSync(new URL("../../../../examples/listing1.json", import.meta.url), "utf8"));

test("validates the paper-inspired listing example", () => {
  const result = validateSLA(golden);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("parses valid AgentSLA JSON", () => {
  assert.equal(parseSLA(golden).GuaranteeTerm.length, 1);
});

test("reports invalid confidence range", () => {
  const invalid = structuredClone(golden);
  invalid.Provider[0].confidence = 2;
  const result = validateSLA(invalid);
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].code, "INVALID_CONFIDENCE");
});

test("reports unknown operator", () => {
  const invalid = structuredClone(golden);
  invalid.GuaranteeTerm[0].SLO[0].BoolExpression.operator = "BELOW";
  const result = validateSLA(invalid);
  assert.equal(result.valid, false);
  assert.equal(result.errors.some((error) => error.code === "UNKNOWN_OPERATOR"), true);
});

test("evaluates SLO comparisons with metric snapshots", () => {
  const result = evaluateSLA(golden, { "AVG TTFT": 0.5 });
  assert.equal(result.passed, true);
});

test("explains scopes, SLOs, and metric references", () => {
  const explanation = explainSLA(golden);
  assert.equal(explanation.guaranteeTerms[0].scopes[0], "Agent 1");
  assert.deepEqual(explanation.guaranteeTerms[0].slos[0].metrics, ["AVG TTFT"]);
});

test("covers every AgentSLA Table 2 metric type", () => {
  const table2Metrics = [
    "PRECISION",
    "RECALL",
    "ACCURACY",
    "AUC",
    "F1_SCORE",
    "XACCU_DIFF",
    "PMV",
    "TRAINING_TIME",
    "POINTWISE_ROBUSTNESS",
    "ADVERSARIAL_FREQUENCY",
    "ADVERSARIAL_SEVERITY",
    "ADVERSARIAL_DISTANCE",
    "TTFT",
    "E2E",
    "BIAS",
    "RACISM",
    "SEXISM",
    "AGEISM",
    "RELIGIOUS",
    "POLITICAL",
    "XENOPHOBIA",
    "SHAP",
    "LIME",
    "ENERGY_CONSUMPTION",
    "WATER_CONSUMPTION",
    "CARBON_EMISSIONS",
    "CARBON_OFFSET",
    "OUTPUT_SIZE",
    "A2A",
    "MCP",
    "OVERSIGHT_LEVEL"
  ];
  assert.deepEqual(table2Metrics.filter((metric) => !METRIC_TYPES.includes(metric as never)), []);
});

test("keeps metric catalog and documentation aligned with Table 2 metrics", () => {
  const table2Metrics = [
    "PRECISION",
    "RECALL",
    "ACCURACY",
    "AUC",
    "F1_SCORE",
    "XACCU_DIFF",
    "PMV",
    "TRAINING_TIME",
    "POINTWISE_ROBUSTNESS",
    "ADVERSARIAL_FREQUENCY",
    "ADVERSARIAL_SEVERITY",
    "ADVERSARIAL_DISTANCE",
    "TTFT",
    "E2E",
    "BIAS",
    "RACISM",
    "SEXISM",
    "AGEISM",
    "RELIGIOUS",
    "POLITICAL",
    "XENOPHOBIA",
    "SHAP",
    "LIME",
    "ENERGY_CONSUMPTION",
    "WATER_CONSUMPTION",
    "CARBON_EMISSIONS",
    "CARBON_OFFSET",
    "OUTPUT_SIZE",
    "A2A",
    "MCP",
    "OVERSIGHT_LEVEL"
  ];
  const catalog = listQualityModel().metricCatalog.map((metric) => metric.metric_type);
  const docs = readFileSync(new URL("../../../../docs/quality-model.md", import.meta.url), "utf8");
  const skillDocs = readFileSync(new URL("../../../../skills/agent-sla/references/quality-model.md", import.meta.url), "utf8");
  assert.deepEqual(table2Metrics.filter((metric) => !catalog.includes(metric as never)), []);
  assert.deepEqual(table2Metrics.filter((metric) => !docs.includes(`\`${metric}\``)), []);
  assert.deepEqual(table2Metrics.filter((metric) => !skillDocs.includes(`\`${metric}\``)), []);
});

test("exports JSON Schema for AgentSLA", () => {
  const schema = getAgentSLAJsonSchema();
  assert.equal(schema.title, "AgentSLA");
  assert.equal(schema.properties.GuaranteeTerm.type, "array");
});
