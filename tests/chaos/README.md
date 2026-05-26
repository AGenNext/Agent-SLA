# Chaos Engineering Guidance

Recommended chaos scenarios:

- pod termination during load
- ingress restart during rollout
- node drain during canary deployment
- temporary network partition
- API latency injection
- dependency timeout simulation
- invalid configuration rollout

Recommended tooling:

- Litmus
- Chaos Mesh
- Gremlin
- kube-monkey

Success criteria:

- readiness recovers automatically
- no sustained error amplification
- autoscaling remains stable
- rollback procedures succeed
- traces and metrics remain available
