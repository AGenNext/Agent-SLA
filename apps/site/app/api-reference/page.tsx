import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent-SLA API Documentation",
  description: "HTTP API reference for validating, parsing, evaluating, and explaining AgentSLA agreements.",
  alternates: { canonical: "/api-reference/" }
};

export default function ApiReferencePage() {
  const endpoints = [
    "GET /health",
    "GET /ready",
    "GET /v1/quality-model",
    "GET /v1/schema",
    "GET /v1/metrics",
    "POST /v1/metrics",
    "POST /v1/sla/validate",
    "POST /v1/sla/parse",
    "POST /v1/sla/evaluate",
    "POST /v1/sla/explain"
  ];
  return (
    <div className="shell prose">
      <h1>Agent-SLA API Documentation</h1>
      <p>The API is a stateless facade over the AgentSLA contract. Persistent runtime state belongs to Agent-Backend.</p>
      <div className="grid">
        {endpoints.map((endpoint) => (
          <div className="card" key={endpoint}>
            <h3>{endpoint}</h3>
            <p>Documented and covered by API tests.</p>
          </div>
        ))}
      </div>
      <h2>Example validation request</h2>
      <pre><code>{`curl -s -H "content-type: application/json" \\
  --data @examples/listing1.json \\
  http://127.0.0.1:8080/v1/sla/validate`}</code></pre>
    </div>
  );
}
