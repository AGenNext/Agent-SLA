# Kubernetes Compatibility Matrix

## Tested Compatibility Targets

| Kubernetes Version | Status |
| --- | --- |
| 1.28 | supported |
| 1.29 | supported |
| 1.30 | supported |

## Required APIs

- apps/v1
- networking.k8s.io/v1
- autoscaling/v2
- policy/v1

Optional CRDs:

- ServiceMonitor (Prometheus Operator)
- Argo Rollouts
- Argo CD Application

## Recommended Controllers

- ingress-nginx
- Prometheus Operator
- cert-manager
- Argo CD
- Argo Rollouts

## Runtime Assumptions

- cgroup v2 supported
- seccomp enabled
- non-root containers permitted
- NetworkPolicy enforcement enabled
