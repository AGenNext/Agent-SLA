import Link from "next/link";
import { JsonLd, softwareJsonLd } from "./components/JsonLd";
import { LeadForm } from "./components/LeadForm";
import { docs, metrics } from "./data/site";

export default function HomePage() {
  return (
    <div className="shell">
      <JsonLd data={softwareJsonLd()} />
      <div className="hero">
        <div>
          <h1>Service level agreements for AI agents.</h1>
          <p className="lede">
            Agent-SLA turns agent quality into a measurable contract: a JSON DSL, SDKs, API facade, MCP tools,
            containers, release gates, and documentation for production AI-agent systems.
          </p>
          <div className="actions">
            <Link className="button primary" href="/lead/">
              Request implementation review
            </Link>
            <Link className="button" href="/whitepaper/">
              Read technical whitepaper
            </Link>
            <a className="button" href="https://github.com/AGenNext/Agent-SLA">
              View GitHub
            </a>
          </div>
        </div>
        <div className="terminal">
          <pre><code>{`npm run release:verify
npm run e2e
npm run security:evaluate
curl /v1/schema`}</code></pre>
        </div>
      </div>

      <section>
        <h2>Docs and artifacts</h2>
        <div className="grid">
          {docs.map((doc) => (
            <article className="card" key={doc.href}>
              <h3>{doc.label}</h3>
              <p>Open the implementation artifact and source documentation.</p>
              <a href={doc.href}>Open artifact</a>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2>Long-form resources</h2>
        <div className="grid">
          <article className="article">
            <h3>Why AI agents need SLAs</h3>
            <p>Architecture, observability, and quality contracts for autonomous systems.</p>
            <Link href="/blog/agent-sla-context-layer/">Read blog</Link>
          </article>
          <article className="article">
            <h3>AI agent metrics that matter</h3>
            <p>How to operationalize Table 2 metrics without reducing agent quality to a vague score.</p>
            <Link href="/blog/ai-agent-sla-metrics/">Read blog</Link>
          </article>
          <article className="article">
            <h3>MCP and agent observability</h3>
            <p>Using MCP as a tool surface while keeping SLA enforcement auditable.</p>
            <Link href="/blog/mcp-agent-observability/">Read blog</Link>
          </article>
        </div>
      </section>

      <section>
        <h2>Metric coverage</h2>
        <div className="metric-list">
          {metrics.map((metric) => (
            <span className="metric" key={metric}>
              {metric}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2>Lead generation</h2>
        <LeadForm />
      </section>
    </div>
  );
}
