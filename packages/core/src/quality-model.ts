import { AGGREGATIONS, METRIC_TYPES, OPERATORS, WINDOW_UNITS } from "./types.js";

export const metricCatalog = [
  { metric_type: "PRECISION", characteristic: "Functional completeness", description: "True positive over all predicted positive." },
  { metric_type: "RECALL", characteristic: "Functional completeness", description: "True positive over all actual positive." },
  { metric_type: "ACCURACY", characteristic: "Functional correctness", description: "Percentage of correct predictions." },
  { metric_type: "AUC", characteristic: "Functional correctness", description: "Probability a positive example is ranked higher than a negative example." },
  { metric_type: "F1_SCORE", characteristic: "Functional completeness", description: "Harmonic mean of precision and recall." },
  { metric_type: "XACCU_DIFF", characteristic: "Functional appropriateness", description: "Accuracy difference between train and test sets." },
  { metric_type: "PMV", characteristic: "Functional appropriateness", description: "Accuracy decrease rate between a model and the same model trained with noisy data." },
  { metric_type: "TRAINING_TIME", characteristic: "Functional appropriateness / Time-behavior", description: "Training time, used as a complexity or time-behavior metric." },
  { metric_type: "POINTWISE_ROBUSTNESS", characteristic: "User error protection", description: "Minimum input change affecting model prediction." },
  { metric_type: "ADVERSARIAL_FREQUENCY", characteristic: "User error protection", description: "Input change impact frequency." },
  { metric_type: "ADVERSARIAL_SEVERITY", characteristic: "Fault-tolerance", description: "Distance between an input and its nearest adversarial example." },
  { metric_type: "ADVERSARIAL_DISTANCE", characteristic: "Fault-tolerance", description: "Adversarial severity on a training input." },
  { metric_type: "TTFT", characteristic: "Time-behavior", description: "Time between request and generation of the first token." },
  { metric_type: "E2E", characteristic: "Time-behavior", description: "Time elapsed between request and end result." },
  { metric_type: "BIAS", characteristic: "Fairness", description: "Ratio of successful bias tests passed." },
  { metric_type: "RACISM", characteristic: "Fairness", description: "Ratio for racism tests." },
  { metric_type: "SEXISM", characteristic: "Fairness", description: "Ratio for sexism tests." },
  { metric_type: "AGEISM", characteristic: "Fairness", description: "Ratio for ageism tests." },
  { metric_type: "RELIGIOUS", characteristic: "Fairness", description: "Ratio for religious bias tests." },
  { metric_type: "POLITICAL", characteristic: "Fairness", description: "Ratio for political bias tests." },
  { metric_type: "XENOPHOBIA", characteristic: "Fairness", description: "Ratio for xenophobia tests." },
  { metric_type: "SHAP", characteristic: "Interpretability", description: "SHAP estimation error." },
  { metric_type: "LIME", characteristic: "Interpretability", description: "Comparison to interpretable local surrogates." },
  { metric_type: "ENERGY_CONSUMPTION", characteristic: "Training impact / Inference impact", description: "Estimated energy consumption." },
  { metric_type: "WATER_CONSUMPTION", characteristic: "Training impact / Inference impact", description: "Estimated water consumption." },
  { metric_type: "CARBON_EMISSIONS", characteristic: "Training impact / Inference impact", description: "Estimated carbon emissions." },
  { metric_type: "CARBON_OFFSET", characteristic: "Mitigation", description: "Percentage of carbon emissions offset by carbon offset credit." },
  { metric_type: "OUTPUT_SIZE", characteristic: "Conciseness", description: "Length of generated output." },
  { metric_type: "A2A", characteristic: "Interoperability", description: "Whether the agent can communicate using A2A; 0 if no, 1 if yes." },
  { metric_type: "MCP", characteristic: "Interoperability", description: "Whether the agent can connect to tools via MCP; 0 if no, 1 if yes." },
  { metric_type: "OVERSIGHT_LEVEL", characteristic: "Autonomy", description: "Level of human oversight." }
] as const;

export const qualityModel = {
  metricTypes: [...METRIC_TYPES],
  metricCatalog,
  operators: [...OPERATORS],
  aggregations: [...AGGREGATIONS],
  windowUnits: [...WINDOW_UNITS],
  backendRuntime: {
    repository: "https://github.com/AGenNext/Agent-Backend",
    localPath: "/Users/apple/Agent-Backend",
    evidence: "surreal/schema/0045_slo_incident_alerting_functions.surql",
    tables: [
      "service_level_objectives",
      "service_level_indicators",
      "error_budget_snapshots",
      "alert_rules",
      "alert_events",
      "incidents",
      "postmortems"
    ]
  }
};

export function listQualityModel() {
  return qualityModel;
}
