import { AGGREGATIONS, METRIC_TYPES, OPERATORS, WINDOW_UNITS } from "./types.js";

const comparisonExpression = {
  type: "object",
  required: ["type", "QoSMetric", "operator", "value"],
  properties: {
    type: { enum: ["Comparison", "COMPARISON"] },
    QoSMetric: { type: "string" },
    operator: { enum: [...OPERATORS] },
    value: { type: "number" }
  },
  additionalProperties: false
} as const;

const junctionExpression = {
  type: "object",
  required: ["type", "BoolExpression"],
  properties: {
    type: { enum: ["And", "AND", "Or", "OR"] },
    BoolExpression: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/$defs/BoolExpression" }
    }
  },
  additionalProperties: false
} as const;

export const agentSLAJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://agennext.github.io/Agent-SLA/schema/agent-sla.schema.json",
  title: "AgentSLA",
  type: "object",
  required: ["GuaranteeTerm"],
  properties: {
    GuaranteeTerm: {
      type: "array",
      items: { $ref: "#/$defs/GuaranteeTerm" }
    },
    QoSMetric: {
      type: "array",
      items: { $ref: "#/$defs/QoSMetric" }
    },
    DerivedQoSMetric: {
      type: "array",
      items: { $ref: "#/$defs/DerivedQoSMetric" }
    },
    QoSDriftMetric: {
      type: "array",
      items: { $ref: "#/$defs/QoSDriftMetric" }
    },
    Provider: {
      type: "array",
      items: { $ref: "#/$defs/Provider" }
    },
    Agent: {
      type: "array",
      items: { $ref: "#/$defs/Agent" }
    },
    ModelCard: {
      type: "array",
      items: { $ref: "#/$defs/ModelCard" }
    }
  },
  additionalProperties: false,
  $defs: {
    GuaranteeTerm: {
      type: "object",
      required: ["Scope", "SLO"],
      properties: {
        Scope: {
          type: "array",
          items: { $ref: "#/$defs/Scope" }
        },
        QualifyingCondition: {
          type: "array",
          items: { $ref: "#/$defs/QualifyingCondition" }
        },
        SLO: {
          type: "array",
          items: { $ref: "#/$defs/SLO" }
        }
      },
      additionalProperties: false
    },
    Scope: {
      type: "object",
      required: ["name", "Agent"],
      properties: {
        name: { type: "string" },
        Agent: { type: "string" }
      },
      additionalProperties: false
    },
    QualifyingCondition: {
      type: "object",
      required: ["BoolExpression"],
      properties: {
        name: { type: "string" },
        BoolExpression: { $ref: "#/$defs/BoolExpression" }
      },
      additionalProperties: false
    },
    SLO: {
      type: "object",
      required: ["name", "BoolExpression"],
      properties: {
        name: { type: "string" },
        BoolExpression: { $ref: "#/$defs/BoolExpression" }
      },
      additionalProperties: false
    },
    BoolExpression: {
      oneOf: [comparisonExpression, junctionExpression]
    },
    Provider: {
      type: "object",
      required: ["name", "confidence"],
      properties: {
        name: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        reputation: { type: "number" }
      },
      additionalProperties: false
    },
    Agent: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        url: { type: "string" },
        ModelCard: { type: "string" }
      },
      additionalProperties: false
    },
    ModelCard: {
      type: "object",
      required: ["name", "model_card"],
      properties: {
        name: { type: "string" },
        model_card: { type: "string" }
      },
      additionalProperties: false
    },
    QoSMetric: {
      type: "object",
      required: ["name", "metric_type", "unit"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        metric_type: { enum: [...METRIC_TYPES] },
        unit: { type: "string" },
        uncertainty: { type: "number" },
        Provider: { type: "string" }
      },
      additionalProperties: false
    },
    DerivedQoSMetric: {
      type: "object",
      required: ["name", "metric_type", "unit", "window", "window_unit", "aggregation"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        metric_type: { enum: [...METRIC_TYPES] },
        unit: { type: "string" },
        uncertainty: { type: "number" },
        Provider: { type: "string" },
        window: { type: "number" },
        window_unit: { enum: [...WINDOW_UNITS] },
        aggregation: { enum: [...AGGREGATIONS] }
      },
      additionalProperties: false
    },
    QoSDriftMetric: {
      type: "object",
      required: ["name", "metric_type", "unit", "current", "baseline"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        metric_type: { enum: [...METRIC_TYPES] },
        unit: { type: "string" },
        uncertainty: { type: "number" },
        Provider: { type: "string" },
        current: { type: "string" },
        baseline: { type: "string" }
      },
      additionalProperties: false
    }
  }
} as const;

export function getAgentSLAJsonSchema() {
  return agentSLAJsonSchema;
}
