import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent SLA Glossary",
  description: "Definitions for AgentSLA, SLO, SLI, MCP, A2A, TTFT, E2E, model card, metric provider, and AI governance terms.",
  alternates: { canonical: "/glossary/" }
};

const terms = [
  ["AgentSLA", "A JSON service level agreement model for AI agents."],
  ["SLO", "Service Level Objective; a measurable threshold for a service quality metric."],
  ["SLI", "Service Level Indicator; an observed measurement used to evaluate an SLO."],
  ["MCP", "Model Context Protocol; a structured tool interface for agents."],
  ["A2A", "Agent-to-Agent protocol interoperability."],
  ["TTFT", "Time to first token."],
  ["E2E", "End-to-end response time."],
  ["Model Card", "A structured description of a model and its intended use."],
  ["Metric Provider", "A system or organization that measures a QoS metric."],
  ["Oversight Level", "The degree of human review required before agent action."]
];

export default function GlossaryPage() {
  return (
    <div className="shell">
      <h1>AI Agent SLA Glossary</h1>
      <div className="glossary-list">
        {terms.map(([term, definition]) => (
          <div className="term" key={term}>
            <h3>{term}</h3>
            <p>{definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
