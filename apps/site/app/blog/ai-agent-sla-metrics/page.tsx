import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Agent SLA Metrics: Precision, Recall, TTFT, Fairness, MCP, and A2A",
  description:
    "A practical guide to the AgentSLA Table 2 metric set for production AI agents, including latency, fairness, robustness, interpretability, and interoperability.",
  alternates: { canonical: "/blog/ai-agent-sla-metrics/" }
};

export default function MetricsBlogPage() {
  return (
    <article className="shell prose">
      <h1>AI Agent SLA Metrics: What to Measure Before Release</h1>
      <p>
        AI agent quality should not collapse into a single score. A useful SLA separates model behavior, runtime
        behavior, interoperability, fairness, interpretability, sustainability, and autonomy into explicit metrics.
      </p>
      <h2>Functional metrics</h2>
      <p>
        Precision, recall, accuracy, AUC, and F1 score describe prediction quality. They are useful when an agent performs
        classification, routing, extraction, or recommendation. XAccuDiff, PMV, and training time help expose overfitting,
        resilience to noisy training data, and complexity.
      </p>
      <h2>Robustness and latency</h2>
      <p>
        Pointwise robustness, adversarial frequency, adversarial severity, and adversarial distance help quantify how
        sensitive an agent is to small input changes. TTFT and E2E response time make user experience measurable.
      </p>
      <h2>Fairness and interpretability</h2>
      <p>
        Bias, racism, sexism, ageism, religious, political, and xenophobia metrics require explicit benchmark providers
        and evidence. SHAP and LIME help make model explanations testable instead of anecdotal.
      </p>
      <h2>Interoperability and autonomy</h2>
      <p>
        A2A and MCP are binary interoperability metrics in v1. Oversight level captures how much human review is required
        before an agent can act. These are product and governance metrics, not only model metrics.
      </p>
    </article>
  );
}
