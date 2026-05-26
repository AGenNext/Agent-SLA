# Enterprise Readiness Controls

This document captures the remaining enterprise-readiness controls for Agent-SLA and separates repository-owned controls from infrastructure-owned and Agent-Backend-owned controls.

## Repository-Owned Controls

- OpenTelemetry-compatible trace propagation
- Prometheus metrics endpoint
- Structured JSON logs
- k6 performance smoke tests
- Kubernetes and Helm deployment manifests
- GitOps and progressive delivery manifests
- SBOM generation and vulnerability scanning in CI/release
- Deployment, performance, and production guidance

## Infrastructure-Owned Controls

- TLS termination
- WAF and API gateway policy
- Secret storage and rotation
- Distributed rate limiting backend
- SIEM ingestion
- Multi-region DNS and failover
- Backup and restore automation
- Compliance evidence retention

## Agent-Backend-Owned Controls

Agent-SLA remains a stateless API facade and SDK surface. The following controls must be implemented in Agent-Backend or the backing control plane:

- persistent SLA objects
- audit event storage
- tenant/project identity
- authorization policy enforcement
- distributed metric registration
- incident state
- alert state
- SurrealDB-backed runtime state
- backup/restore of persistent SLA state

## Certification Gate

A production promotion should require:

- unit tests passing
- e2e tests passing
- security evaluation passing
- vulnerability scans passing
- SBOM artifact generated
- performance smoke test passing
- runtime conformance suite passing
- deployment manifest validation passing
- documented rollback plan
- documented incident contact path
