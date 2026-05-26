import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent-SLA MCP Documentation",
  description: "MCP tool reference for validating, drafting, evaluating, and explaining AgentSLA agreements.",
  alternates: { canonical: "/mcp-reference/" }
};

export default function McpReferencePage() {
  const tools = [
    "validate_agent_sla",
    "explain_agent_sla",
    "draft_agent_sla",
    "evaluate_agent_sla",
    "list_quality_model",
    "get_agent_sla_json_schema",
    "suggest_slo_metrics"
  ];
  return (
    <div className="shell prose">
      <h1>Agent-SLA MCP Documentation</h1>
      <p>The MCP server exposes AgentSLA operations over stdio JSON-RPC for agent tooling workflows.</p>
      <div className="grid">
        {tools.map((tool) => (
          <div className="card" key={tool}>
            <h3>{tool}</h3>
            <p>Available through `tools/call` and covered by MCP smoke tests.</p>
          </div>
        ))}
      </div>
      <h2>List tools</h2>
      <pre><code>{`{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}`}</code></pre>
    </div>
  );
}
