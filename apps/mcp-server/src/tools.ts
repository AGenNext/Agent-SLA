import { evaluateSLA, explainSLA, getAgentSLAJsonSchema, listQualityModel, validateSLA } from "@agent-sla/core";

export const tools = [
  "validate_agent_sla",
  "explain_agent_sla",
  "draft_agent_sla",
  "evaluate_agent_sla",
  "list_quality_model",
  "get_agent_sla_json_schema",
  "suggest_slo_metrics"
];

export async function callTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "validate_agent_sla":
      return validateSLA(args.sla);
    case "explain_agent_sla":
      return explainSLA(args.sla as never);
    case "evaluate_agent_sla":
      return evaluateSLA(args.sla as never, (args.metrics as Record<string, number>) ?? {});
    case "list_quality_model":
      return listQualityModel();
    case "get_agent_sla_json_schema":
      return getAgentSLAJsonSchema();
    case "suggest_slo_metrics":
      return {
        suggestions: listQualityModel().metricCatalog.map((metric) => ({
          ...metric,
          operators: metric.metric_type === "TTFT" || metric.metric_type === "E2E" ? ["LESS", "LESS_OR_EQUAL"] : ["GREATER_OR_EQUAL"]
        }))
      };
    case "draft_agent_sla":
      return {
        GuaranteeTerm: [
          {
            Scope: [{ name: "Default Scope", Agent: args.agentName ?? "Agent 1" }],
            QualifyingCondition: [],
            SLO: [
              {
                name: "TTFT under one second",
                BoolExpression: { type: "Comparison", QoSMetric: "AVG TTFT", operator: "LESS", value: 1 }
              }
            ]
          }
        ],
        DerivedQoSMetric: [
          {
            name: "AVG TTFT",
            description: "Average time to first token.",
            metric_type: "TTFT",
            unit: "sec",
            uncertainty: 0,
            window: 10,
            window_unit: "MESSAGE",
            aggregation: "AVG",
            Provider: "Default Provider"
          }
        ],
        Provider: [{ name: "Default Provider", confidence: 0.9, reputation: 0 }],
        Agent: [{ name: args.agentName ?? "Agent 1", ModelCard: args.modelName ?? "Model 1" }],
        ModelCard: [{ name: args.modelName ?? "Model 1", model_card: "" }]
      };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
