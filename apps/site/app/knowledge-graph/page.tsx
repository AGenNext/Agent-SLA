import type { Metadata } from "next";
import { JsonLd } from "../components/JsonLd";

export const metadata: Metadata = {
  title: "Agent-SLA Schema.org Knowledge Graph",
  description: "Schema.org JSON-LD knowledge graph for Agent-SLA software, documentation, API, MCP, SDKs, and whitepaper.",
  alternates: { canonical: "/knowledge-graph/" }
};

export default function KnowledgeGraphPage() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareSourceCode",
        "@id": "https://github.com/AGenNext/Agent-SLA#source",
        name: "Agent-SLA",
        codeRepository: "https://github.com/AGenNext/Agent-SLA",
        programmingLanguage: ["TypeScript", "Python", "Rust"]
      },
      {
        "@type": "TechArticle",
        "@id": "https://agennext.github.io/Agent-SLA/whitepaper/#whitepaper",
        headline: "Technical Whitepaper: AgentSLA for Production AI Agents"
      },
      {
        "@type": "APIReference",
        "@id": "https://agennext.github.io/Agent-SLA/api-reference/#api",
        name: "Agent-SLA HTTP API"
      },
      {
        "@type": "DefinedTermSet",
        "@id": "https://agennext.github.io/Agent-SLA/glossary/#terms",
        name: "AI Agent SLA Glossary"
      }
    ]
  };
  return (
    <div className="shell prose">
      <JsonLd data={graph} />
      <h1>Schema.org Knowledge Graph</h1>
      <p>This page publishes the Agent-SLA knowledge graph as Schema.org JSON-LD for search engines and AI crawlers.</p>
      <pre><code>{JSON.stringify(graph, null, 2)}</code></pre>
    </div>
  );
}
