import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { callTool, tools } from "../src/tools.js";

const golden = JSON.parse(readFileSync(new URL("../../../../examples/listing1.json", import.meta.url), "utf8"));

test("lists expected MCP tools", () => {
  assert.deepEqual(tools, [
    "validate_agent_sla",
    "explain_agent_sla",
    "draft_agent_sla",
    "evaluate_agent_sla",
    "list_quality_model",
    "get_agent_sla_json_schema",
    "suggest_slo_metrics"
  ]);
});

test("validates AgentSLA through MCP tool", async () => {
  const result = await callTool("validate_agent_sla", { sla: golden });
  assert.equal((result as { valid: boolean }).valid, true);
});

test("covers every MCP tool", async () => {
  const calls = [
    callTool("validate_agent_sla", { sla: golden }),
    callTool("explain_agent_sla", { sla: golden }),
    callTool("draft_agent_sla", { agentName: "Agent 1", modelName: "GPT 4o" }),
    callTool("evaluate_agent_sla", { sla: golden, metrics: { "AVG TTFT": 0.5 } }),
    callTool("list_quality_model", {}),
    callTool("get_agent_sla_json_schema", {}),
    callTool("suggest_slo_metrics", {})
  ];
  const results = await Promise.all(calls);
  assert.equal(results.length, tools.length);
});
