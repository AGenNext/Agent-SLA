import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

const port = Number(process.env.E2E_PORT ?? 18080);
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn("node", ["apps/api/dist/src/server.js"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port), NODE_ENV: "test" },
  stdio: ["ignore", "pipe", "pipe"]
});

let output = "";
server.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

async function waitForHealth() {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`API did not become healthy. Output:\n${output}`);
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers ?? {})
    }
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

try {
  await waitForHealth();
  const sla = JSON.parse(await readFile(new URL("../examples/listing1.json", import.meta.url), "utf8"));

  const ready = await request("/ready");
  if (ready.status !== "ready") throw new Error("/ready did not return ready status");

  const schema = await request("/v1/schema");
  if (schema.title !== "AgentSLA") throw new Error("/v1/schema did not return AgentSLA schema");

  const qualityModel = await request("/v1/quality-model");
  if (!qualityModel.metricTypes.includes("PRECISION")) throw new Error("Quality model is missing PRECISION");

  const validation = await request("/v1/sla/validate", {
    method: "POST",
    body: JSON.stringify(sla)
  });
  if (!validation.valid) throw new Error(`Golden SLA failed validation: ${JSON.stringify(validation.errors)}`);

  const evaluation = await request("/v1/sla/evaluate", {
    method: "POST",
    body: JSON.stringify({ sla, metrics: { "AVG TTFT": 0.5 } })
  });
  if (!evaluation.passed) throw new Error(`Golden SLA evaluation failed: ${JSON.stringify(evaluation)}`);

  const explain = await request("/v1/sla/explain", {
    method: "POST",
    body: JSON.stringify(sla)
  });
  if (!explain.summary.includes("1 guarantee term")) throw new Error("Explanation summary is unexpected");

  const metric = await request("/v1/metrics", {
    method: "POST",
    body: JSON.stringify({ name: "release-smoke-ttft", metric_type: "TTFT", unit: "sec" })
  });
  if (metric.name !== "release-smoke-ttft") throw new Error("Metric registration failed");

  console.log("Agent-SLA E2E smoke passed");
} finally {
  server.kill("SIGTERM");
}
