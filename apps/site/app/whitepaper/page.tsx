import type { Metadata } from "next";
import { LeadForm } from "../components/LeadForm";

export const metadata: Metadata = {
  title: "Technical Whitepaper: AgentSLA for Production AI Agents",
  description:
    "A technical whitepaper for implementing AgentSLA contracts across SDKs, APIs, MCP tools, containers, and Agent-Backend runtime state.",
  alternates: { canonical: "/whitepaper/" }
};

export default function WhitepaperPage() {
  return (
    <div className="shell prose">
      <h1>Technical Whitepaper: AgentSLA for Production AI Agents</h1>
      <p>
        Agent-SLA operationalizes service level agreements for AI agents by combining a JSON DSL, canonical validation,
        SDKs, an HTTP API facade, MCP tools, containers, release gates, and an adapter boundary for Agent-Backend.
      </p>
      <h2>Architecture</h2>
      <p>
        The TypeScript core is the canonical contract. Python and Rust mirror the parser, validator, evaluator, and
        explainer. The API and MCP server expose the same contract to services and agent tools. The release workflow
        enforces unit tests, E2E smoke tests, security evaluation, CodeQL, and container builds.
      </p>
      <h2>Runtime model</h2>
      <p>
        Runtime state belongs in Agent-Backend. Agent-SLA can save agreements, load metric snapshots, and record
        evaluation results through an adapter, but it does not own tenant state, identity, incidents, alerting, or
        SurrealDB persistence.
      </p>
      <h2>Governance model</h2>
      <p>
        The quality model covers functional metrics, robustness, latency, fairness, interpretability, sustainability,
        interoperability, and autonomy. Production teams should attach evidence to every metric provider and treat
        provider confidence as part of the agreement.
      </p>
      <LeadForm />
    </div>
  );
}
