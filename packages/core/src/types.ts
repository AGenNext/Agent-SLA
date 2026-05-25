export const METRIC_TYPES = [
  "ACCURACY",
  "ADVERSARIAL_DISTANCE",
  "ADVERSARIAL_FREQUENCY",
  "ADVERSARIAL_SEVERITY",
  "AGEISM",
  "A2A",
  "AUC",
  "BIAS",
  "CARBON_EMISSIONS",
  "CARBON_OFFSET",
  "E2E",
  "E2E_LATENCY",
  "ENERGY_CONSUMPTION",
  "F1_SCORE",
  "LIME",
  "MCP",
  "OUTPUT_SIZE",
  "OVERSIGHT_LEVEL",
  "PMV",
  "POINTWISE_ROBUSTNESS",
  "POLITICAL",
  "PRECISION",
  "RACISM",
  "RECALL",
  "RELIGIOUS",
  "SEXISM",
  "SHAP",
  "TRAINING_TIME",
  "TTFT",
  "WATER_CONSUMPTION",
  "XACCU_DIFF",
  "XENOPHOBIA"
] as const;

export const OPERATORS = ["LESS", "LESS_OR_EQUAL", "EQUAL", "GREATER_OR_EQUAL", "GREATER"] as const;
export const AGGREGATIONS = ["AVG", "MEDIAN", "MIN", "MAX", "SUM", "COUNT", "P95", "P99"] as const;
export const WINDOW_UNITS = ["MESSAGE", "SECOND", "MINUTE", "HOUR", "DAY"] as const;

export type MetricType = (typeof METRIC_TYPES)[number];
export type Operator = (typeof OPERATORS)[number];
export type AggregationFunction = (typeof AGGREGATIONS)[number];
export type WindowUnit = (typeof WINDOW_UNITS)[number];

export interface AgentSLA {
  GuaranteeTerm: GuaranteeTerm[];
  QoSMetric?: QoSMetric[];
  DerivedQoSMetric?: DerivedQoSMetric[];
  QoSDriftMetric?: QoSDriftMetric[];
  Provider?: Provider[];
  Agent?: Agent[];
  ModelCard?: ModelCard[];
}

export interface GuaranteeTerm {
  Scope: Scope[];
  QualifyingCondition?: QualifyingCondition[];
  SLO: SLO[];
}

export interface Scope {
  name: string;
  Agent: string;
}

export interface QualifyingCondition {
  name?: string;
  BoolExpression: BoolExpression;
}

export interface SLO {
  name: string;
  BoolExpression: BoolExpression;
}

export type BoolExpression = ComparisonExpression | JunctionExpression;

export interface ComparisonExpression {
  type: "Comparison" | "COMPARISON";
  QoSMetric: string;
  operator: Operator;
  value: number;
}

export interface JunctionExpression {
  type: "And" | "AND" | "Or" | "OR";
  BoolExpression: BoolExpression[];
}

export interface Provider {
  name: string;
  confidence: number;
  reputation?: number;
}

export interface Agent {
  name: string;
  description?: string;
  url?: string;
  ModelCard?: string;
}

export interface ModelCard {
  name: string;
  model_card: string;
}

export interface QoSMetric {
  name: string;
  description?: string;
  metric_type: string;
  unit: string;
  uncertainty?: number;
  Provider?: string;
}

export interface DerivedQoSMetric extends QoSMetric {
  window: number;
  window_unit: string;
  aggregation: string;
}

export interface QoSDriftMetric extends QoSMetric {
  current: string;
  baseline: string;
}

export interface ValidationError {
  code: string;
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface MetricSnapshot {
  [metricName: string]: number;
}

export interface EvaluationResult {
  passed: boolean;
  terms: TermEvaluation[];
  errors: ValidationError[];
}

export interface TermEvaluation {
  index: number;
  passed: boolean;
  slos: SloEvaluation[];
}

export interface SloEvaluation {
  name: string;
  passed: boolean;
  value?: boolean;
}

export interface Explanation {
  summary: string;
  guaranteeTerms: Array<{
    index: number;
    scopes: string[];
    slos: Array<{
      name: string;
      metrics: string[];
    }>;
  }>;
}
