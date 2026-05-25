import { AgentSLA, EvaluationResult, MetricSnapshot } from "./types.js";

export interface AgentBackendAdapter {
  saveSLA(tenantId: string, key: string, sla: AgentSLA): Promise<{ id: string }>;
  loadSLA(tenantId: string, key: string): Promise<AgentSLA | undefined>;
  loadMetricSnapshot(tenantId: string, metricNames: string[]): Promise<MetricSnapshot>;
  recordEvaluation(tenantId: string, key: string, result: EvaluationResult): Promise<{ id: string }>;
}

export const agentBackendEvidence = {
  repository: "https://github.com/AGenNext/Agent-Backend",
  localPath: "/Users/apple/Agent-Backend",
  runtimeSchema: "surreal/schema/0045_slo_incident_alerting_functions.surql"
};
