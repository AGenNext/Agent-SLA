import {
  AGGREGATIONS,
  AgentSLA,
  BoolExpression,
  METRIC_TYPES,
  OPERATORS,
  ValidationError,
  ValidationResult,
  WINDOW_UNITS
} from "./types.js";

function hasName(value: unknown): value is { name: string } {
  return typeof value === "object" && value !== null && typeof (value as { name?: unknown }).name === "string";
}

function indexByName(values: unknown[] | undefined): Map<string, unknown> {
  const index = new Map<string, unknown>();
  for (const value of values ?? []) {
    if (hasName(value)) index.set(value.name, value);
  }
  return index;
}

function add(errors: ValidationError[], code: string, path: string, message: string) {
  errors.push({ code, path, message });
}

export function validateSLA(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  if (typeof input !== "object" || input === null) {
    return { valid: false, errors: [{ code: "INVALID_ROOT", path: "$", message: "SLA must be a JSON object." }] };
  }

  const sla = input as Partial<AgentSLA>;
  if (!Array.isArray(sla.GuaranteeTerm)) {
    add(errors, "MISSING_GUARANTEE_TERM", "GuaranteeTerm", "GuaranteeTerm must be an array.");
  }

  const agents = indexByName(sla.Agent);
  const modelCards = indexByName(sla.ModelCard);
  const providers = indexByName(sla.Provider);
  const metrics = new Map<string, unknown>([
    ...indexByName(sla.QoSMetric),
    ...indexByName(sla.DerivedQoSMetric),
    ...indexByName(sla.QoSDriftMetric)
  ]);

  for (const [index, provider] of (sla.Provider ?? []).entries()) {
    if (typeof provider.confidence !== "number" || provider.confidence < 0 || provider.confidence > 1) {
      add(errors, "INVALID_CONFIDENCE", `Provider[${index}].confidence`, "Provider confidence must be between 0 and 1.");
    }
  }

  validateMetrics(errors, "QoSMetric", sla.QoSMetric, providers);
  validateMetrics(errors, "DerivedQoSMetric", sla.DerivedQoSMetric, providers, true);
  validateMetrics(errors, "QoSDriftMetric", sla.QoSDriftMetric, providers);

  for (const [index, metric] of (sla.QoSDriftMetric ?? []).entries()) {
    if (!metrics.has(metric.current)) {
      add(errors, "UNKNOWN_METRIC_REFERENCE", `QoSDriftMetric[${index}].current`, `Unknown current metric: ${metric.current}`);
    }
    if (!metrics.has(metric.baseline)) {
      add(errors, "UNKNOWN_METRIC_REFERENCE", `QoSDriftMetric[${index}].baseline`, `Unknown baseline metric: ${metric.baseline}`);
    }
  }

  for (const [index, agent] of (sla.Agent ?? []).entries()) {
    if (agent.ModelCard && !modelCards.has(agent.ModelCard)) {
      add(errors, "UNKNOWN_MODEL_CARD", `Agent[${index}].ModelCard`, `Unknown model card: ${agent.ModelCard}`);
    }
  }

  for (const [termIndex, term] of (sla.GuaranteeTerm ?? []).entries()) {
    if (!Array.isArray(term.Scope)) {
      add(errors, "MISSING_SCOPE", `GuaranteeTerm[${termIndex}].Scope`, "Scope must be an array.");
      continue;
    }
    for (const [scopeIndex, scope] of term.Scope.entries()) {
      if (!agents.has(scope.Agent)) {
        add(errors, "UNKNOWN_AGENT", `GuaranteeTerm[${termIndex}].Scope[${scopeIndex}].Agent`, `Unknown agent: ${scope.Agent}`);
      }
    }
    if (!Array.isArray(term.SLO)) {
      add(errors, "MISSING_SLO", `GuaranteeTerm[${termIndex}].SLO`, "SLO must be an array.");
      continue;
    }
    for (const [sloIndex, slo] of term.SLO.entries()) {
      validateExpression(errors, slo.BoolExpression, `GuaranteeTerm[${termIndex}].SLO[${sloIndex}].BoolExpression`, metrics);
    }
    for (const [conditionIndex, condition] of (term.QualifyingCondition ?? []).entries()) {
      validateExpression(
        errors,
        condition.BoolExpression,
        `GuaranteeTerm[${termIndex}].QualifyingCondition[${conditionIndex}].BoolExpression`,
        metrics
      );
    }
  }

  return { valid: errors.length === 0, errors };
}

function validateMetrics(
  errors: ValidationError[],
  collectionName: string,
  values: Array<{ name: string; metric_type: string; unit: string; Provider?: string; window_unit?: string; aggregation?: string }> | undefined,
  providers: Map<string, unknown>,
  derived = false
) {
  for (const [index, metric] of (values ?? []).entries()) {
    const path = `${collectionName}[${index}]`;
    if (!metric.unit) add(errors, "MISSING_UNIT", `${path}.unit`, "Metric unit is required.");
    if (!METRIC_TYPES.includes(metric.metric_type as never)) {
      add(errors, "UNKNOWN_METRIC_TYPE", `${path}.metric_type`, `Unknown metric type: ${metric.metric_type}`);
    }
    if (metric.Provider && !providers.has(metric.Provider)) {
      add(errors, "UNKNOWN_PROVIDER", `${path}.Provider`, `Unknown provider: ${metric.Provider}`);
    }
    if (derived) {
      if (!WINDOW_UNITS.includes(metric.window_unit as never)) {
        add(errors, "UNKNOWN_WINDOW_UNIT", `${path}.window_unit`, `Unknown window unit: ${metric.window_unit}`);
      }
      if (!AGGREGATIONS.includes(metric.aggregation as never)) {
        add(errors, "UNKNOWN_AGGREGATION", `${path}.aggregation`, `Unknown aggregation: ${metric.aggregation}`);
      }
    }
  }
}

function validateExpression(errors: ValidationError[], expression: BoolExpression | undefined, path: string, metrics: Map<string, unknown>) {
  if (!expression || typeof expression !== "object") {
    add(errors, "INVALID_EXPRESSION", path, "BoolExpression must be an object.");
    return;
  }
  if (expression.type === "Comparison" || expression.type === "COMPARISON") {
    if (!metrics.has(expression.QoSMetric)) {
      add(errors, "UNKNOWN_METRIC_REFERENCE", `${path}.QoSMetric`, `Unknown metric: ${expression.QoSMetric}`);
    }
    if (!OPERATORS.includes(expression.operator as never)) {
      add(errors, "UNKNOWN_OPERATOR", `${path}.operator`, `Unknown operator: ${expression.operator}`);
    }
    if (typeof expression.value !== "number") {
      add(errors, "INVALID_THRESHOLD", `${path}.value`, "Comparison value must be a number.");
    }
    return;
  }
  if (expression.type === "And" || expression.type === "AND" || expression.type === "Or" || expression.type === "OR") {
    if (!Array.isArray(expression.BoolExpression) || expression.BoolExpression.length === 0) {
      add(errors, "EMPTY_JUNCTION", `${path}.BoolExpression`, "Junction expressions require at least one child expression.");
      return;
    }
    expression.BoolExpression.forEach((child, index) => validateExpression(errors, child, `${path}.BoolExpression[${index}]`, metrics));
    return;
  }
  add(errors, "UNKNOWN_EXPRESSION_TYPE", `${path}.type`, `Unknown expression type: ${(expression as { type?: unknown }).type}`);
}
