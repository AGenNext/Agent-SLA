# Deployment Strategies

## Recommended Strategy

Use GitOps with Argo CD and progressive delivery using Argo Rollouts.

## Supported Deployment Modes

- Rolling deployments
- Canary deployments
- Blue/green deployments
- GitOps-managed reconciliation

## Canary Rollout Guidance

Recommended progressive traffic shifts:

1. 10% for 1 minute
2. 25% for 2 minutes
3. 50% for 5 minutes
4. 100% promotion

Rollback immediately if:

- Error rate exceeds 1%
- p95 latency exceeds SLA threshold
- Pod restart loops occur
- Readiness failures exceed threshold

## Blue/Green Guidance

Use separate stable and preview services.

Recommended flow:

1. Deploy preview environment
2. Run smoke and synthetic tests
3. Shift ingress traffic
4. Observe metrics/traces/logs
5. Promote or rollback

## GitOps Guidance

Recommended controllers:

- Argo CD
- Flux CD

Recommended practices:

- Immutable image tags
- Signed OCI images
- Branch protection
- Required CI checks
- Environment promotion via pull requests
- Drift detection enabled

## Multi-Environment Promotion

Suggested environments:

- dev
- staging
- production

Promote only after:

- integration tests pass
- security scans pass
- SLA conformance tests pass
- synthetic health checks pass
