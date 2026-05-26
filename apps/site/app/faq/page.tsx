import type { Metadata } from "next";
import { JsonLd } from "../components/JsonLd";

export const metadata: Metadata = {
  title: "Agent-SLA FAQ",
  description: "Frequently asked questions about AgentSLA, AI agent SLAs, API usage, MCP tools, metrics, and Agent-Backend runtime integration.",
  alternates: { canonical: "/faq/" }
};

const faqs = [
  ["What is Agent-SLA?", "Agent-SLA is a DSL, SDK, API, MCP server, container package, and skill for AI-agent service level agreements."],
  ["Does Agent-SLA store runtime data?", "No. Agent-Backend owns database and runtime state."],
  ["Which metrics are covered?", "The implementation covers the AgentSLA Table 2 metric set, including precision, recall, TTFT, E2E, fairness, MCP, A2A, and oversight level."],
  ["Can I use Agent-SLA with MCP?", "Yes. The MCP server exposes validation, drafting, evaluation, schema, quality model, and metric suggestion tools."],
  ["How are releases enforced?", "Release workflows run unit tests, E2E smoke tests, security evaluation, CodeQL, and Docker builds."]
];

export default function FaqPage() {
  return (
    <div className="shell prose">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map(([question, answer]) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer }
          }))
        }}
      />
      <h1>Agent-SLA FAQ</h1>
      {faqs.map(([question, answer]) => (
        <section key={question}>
          <h2>{question}</h2>
          <p>{answer}</p>
        </section>
      ))}
    </div>
  );
}
