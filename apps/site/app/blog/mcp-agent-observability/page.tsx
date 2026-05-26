import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MCP, Tool Use, and AI Agent Observability",
  description:
    "How MCP tools, AgentSLA validation, and runtime evidence combine into auditable AI agent operations.",
  alternates: { canonical: "/blog/mcp-agent-observability/" }
};

export default function McpBlogPage() {
  return (
    <article className="shell prose">
      <h1>MCP, Tool Use, and AI Agent Observability</h1>
      <p>
        MCP gives agents a structured way to call tools. That makes the tool surface observable, but observability is not
        the same as governance. Agent-SLA adds a measurable agreement around the agent, the model card, the metric
        provider, and the SLO thresholds used to decide whether a workflow is acceptable.
      </p>
      <h2>Why MCP needs quality contracts</h2>
      <p>
        Tool calls can succeed technically while failing the user. A tool may return too slowly, omit required evidence,
        use stale context, or require more human oversight than expected. MCP tools should therefore be measured against
        explicit SLOs, including TTFT, E2E response time, interoperability, and oversight level.
      </p>
      <h2>Agent-SLA MCP tools</h2>
      <p>
        The Agent-SLA MCP server exposes validation, explanation, drafting, evaluation, quality model discovery, JSON
        Schema discovery, and SLO metric suggestions. These tools keep agreement work close to the agent workflow.
      </p>
    </article>
  );
}
