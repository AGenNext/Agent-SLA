import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { handleRequest } from "../src/handler.js";

const golden = JSON.parse(readFileSync(new URL("../../../../examples/listing1.json", import.meta.url), "utf8"));

test("validates SLA through API handler", async () => {
  const response = await handleRequest("POST", "/v1/sla/validate", golden);
  assert.equal(response.status, 200);
  assert.equal((response.body as { valid: boolean }).valid, true);
});

test("evaluates SLA through API handler", async () => {
  const response = await handleRequest("POST", "/v1/sla/evaluate", { sla: golden, metrics: { "AVG TTFT": 0.5 } });
  assert.equal(response.status, 200);
  assert.equal((response.body as { passed: boolean }).passed, true);
});

test("covers every documented API endpoint", async () => {
  const checks = [
    await handleRequest("POST", "/v1/sla/validate", golden),
    await handleRequest("POST", "/v1/sla/parse", golden),
    await handleRequest("POST", "/v1/sla/evaluate", { sla: golden, metrics: { "AVG TTFT": 0.5 } }),
    await handleRequest("POST", "/v1/sla/explain", golden),
    await handleRequest("GET", "/v1/quality-model", undefined),
    await handleRequest("GET", "/v1/schema", undefined),
    await handleRequest("GET", "/v1/metrics", undefined),
    await handleRequest("POST", "/v1/metrics", { name: "AVG TTFT", metric_type: "TTFT", unit: "sec" })
  ];
  assert.deepEqual(checks.map((check) => check.status), [200, 200, 200, 200, 200, 200, 200, 201]);
});
