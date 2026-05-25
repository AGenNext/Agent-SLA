import { AgentSLA, BoolExpression, EvaluationResult, JunctionExpression, MetricSnapshot, ValidationError } from "./types.js";
import { validateSLA } from "./validator.js";

export function evaluateSLA(input: AgentSLA, metrics: MetricSnapshot): EvaluationResult {
  const validation = validateSLA(input);
  if (!validation.valid) {
    return { passed: false, terms: [], errors: validation.errors };
  }

  const errors: ValidationError[] = [];
  const terms = input.GuaranteeTerm.map((term, index) => {
    const slos = term.SLO.map((slo) => {
      const value = evaluateExpression(slo.BoolExpression, metrics, errors, `GuaranteeTerm[${index}].SLO.${slo.name}`);
      return { name: slo.name, passed: value === true, value };
    });
    return { index, passed: slos.every((slo) => slo.passed), slos };
  });

  return { passed: errors.length === 0 && terms.every((term) => term.passed), terms, errors };
}

function evaluateExpression(expression: BoolExpression, metrics: MetricSnapshot, errors: ValidationError[], path: string): boolean | undefined {
  if (expression.type === "Comparison" || expression.type === "COMPARISON") {
    const actual = metrics[expression.QoSMetric];
    if (typeof actual !== "number") {
      errors.push({ code: "METRIC_VALUE_MISSING", path, message: `Missing metric value: ${expression.QoSMetric}` });
      return undefined;
    }
    switch (expression.operator) {
      case "LESS":
        return actual < expression.value;
      case "LESS_OR_EQUAL":
        return actual <= expression.value;
      case "EQUAL":
        return actual === expression.value;
      case "GREATER_OR_EQUAL":
        return actual >= expression.value;
      case "GREATER":
        return actual > expression.value;
    }
  }
  const junction = expression as JunctionExpression;
  const values = junction.BoolExpression.map((child) => evaluateExpression(child, metrics, errors, path));
  if (expression.type === "And" || expression.type === "AND") return values.every(Boolean);
  if (expression.type === "Or" || expression.type === "OR") return values.some(Boolean);
  return undefined;
}
