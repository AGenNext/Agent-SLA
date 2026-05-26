# Performance Testing

## Overview

Agent-SLA includes a k6-based smoke performance suite for validating runtime latency, availability, and error-rate behavior before production promotion.

## Included Checks

The smoke suite validates:

- HTTP availability
- SLA evaluation latency
- API success rate
- Error-rate thresholds

## Default Thresholds

- p95 latency < 500ms
- request failure rate < 1%
- success rate > 99%

## Running Locally

```bash
npm run performance:smoke
```

## Environment Variables

```bash
export AGENT_SLA_BASE_URL=http://localhost:8080
export AGENT_SLA_API_TOKEN=change-me
export K6_VUS=10
export K6_DURATION=60s
```

## CI/CD Recommendation

Run smoke performance tests:

- before production promotion
- after infrastructure changes
- after runtime dependency upgrades
- during canary rollouts

## Recommended Production Testing

Additional recommended suites:

- soak testing
- spike testing
- sustained concurrency testing
- rate-limit validation
- autoscaling validation
- regional failover testing

## Recommended Observability During Tests

Collect:

- Prometheus metrics
- distributed traces
- structured logs
- pod restart counts
- CPU/memory saturation
- ingress latency
