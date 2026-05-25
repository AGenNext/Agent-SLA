---
name: agent-sla
description: Use when drafting, validating, explaining, evaluating, or integrating AgentSLA agreements for AI agents, including SLO metrics, QoS terms, MCP/API/SDK usage, and Agent-Backend runtime mapping.
metadata:
  short-description: Work with AgentSLA agreements for AI agents
---

# AgentSLA

Use this skill to create, review, validate, or operationalize service level
agreements for AI agents.

## Workflow

1. Identify the target agent, model card, provider, and service scope.
2. Select measurable QoS metrics from the quality model.
3. Draft JSON AgentSLA with guarantee terms, scopes, SLOs, and metric
   definitions.
4. Validate the agreement before using it.
5. Explain the SLOs in product language and attach evidence.
6. For runtime work, map the agreement to Agent-Backend instead of inventing a
   new database store.

## Runtime Boundary

Agent-SLA owns the DSL, SDK, API facade, MCP tools, and skill. Agent-Backend owns
database and runtime state. For persistence or live evaluation, use the
Agent-Backend adapter boundary.

Evidence:

- Agent-Backend repo: `https://github.com/AGenNext/Agent-Backend`
- Local runtime schema: `/Users/apple/Agent-Backend/surreal/schema/0045_slo_incident_alerting_functions.surql`

## When More Detail Is Needed

- DSL rules: read `references/dsl.md`.
- Quality model, metric examples, and naming policy: read
  `references/quality-model.md`.
- Example agreements: read `references/examples.md`.

## Guardrails

- Do not claim an SLO is enforceable unless metric source and evaluation window
  are defined.
- Do not treat LLM quality as a single score; map it to explicit metrics.
- Keep provider confidence and uncertainty visible.
- Attach evidence: file paths, API outputs, metric source, or backend record IDs.
