import { evaluateSLA, explainSLA, getAgentSLAJsonSchema, listQualityModel, parseSLA, validateSLA } from "@agent-sla/core";

const registeredMetrics = new Map<string, unknown>();

export interface ApiResponse {
  status: number;
  body: unknown;
}

export const serviceInfo = {
  name: "agent-sla-api",
  version: "0.1.0"
};

export async function handleRequest(method: string, pathname: string, body: unknown): Promise<ApiResponse> {
  if (method === "GET" && pathname === "/health") {
    return { status: 200, body: { status: "ok", ...serviceInfo } };
  }
  if (method === "GET" && pathname === "/ready") {
    return { status: 200, body: { status: "ready", ...serviceInfo } };
  }
  if (method === "GET" && pathname === "/v1/quality-model") {
    return { status: 200, body: listQualityModel() };
  }
  if (method === "GET" && pathname === "/v1/schema") {
    return { status: 200, body: getAgentSLAJsonSchema() };
  }
  if (method === "GET" && pathname === "/v1/metrics") {
    return { status: 200, body: { metrics: [...registeredMetrics.values()] } };
  }
  if (method === "POST" && pathname === "/v1/metrics") {
    if (!body || typeof body !== "object" || typeof (body as { name?: unknown }).name !== "string") {
      return { status: 400, body: { error: "Metric registration requires a name." } };
    }
    registeredMetrics.set((body as { name: string }).name, body);
    return { status: 201, body };
  }
  if (method === "POST" && pathname === "/v1/sla/validate") {
    return { status: 200, body: validateSLA(body) };
  }
  if (method === "POST" && pathname === "/v1/sla/parse") {
    try {
      return { status: 200, body: { sla: parseSLA(body) } };
    } catch (error) {
      return { status: 400, body: { error: error instanceof Error ? error.message : String(error) } };
    }
  }
  if (method === "POST" && pathname === "/v1/sla/evaluate") {
    const payload = body as { sla?: unknown; metrics?: Record<string, number> };
    const validation = validateSLA(payload?.sla);
    if (!validation.valid) return { status: 400, body: validation };
    return { status: 200, body: evaluateSLA(payload.sla as never, payload.metrics ?? {}) };
  }
  if (method === "POST" && pathname === "/v1/sla/explain") {
    const validation = validateSLA(body);
    if (!validation.valid) return { status: 400, body: validation };
    return { status: 200, body: explainSLA(body as never) };
  }
  return { status: 404, body: { error: "Not found" } };
}
