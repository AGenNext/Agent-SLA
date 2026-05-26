# Disaster Recovery Runbook

## Recovery Objectives

Recommended defaults:

- RPO: 15 minutes
- RTO: 30 minutes

## Failure Domains

- Kubernetes node loss
- cluster control-plane outage
- ingress outage
- registry outage
- backing persistence outage
- DNS outage
- regional outage

## Recommended Recovery Controls

- multi-zone Kubernetes clusters
- GitOps-managed manifests
- immutable container images
- versioned Helm releases
- external secret manager
- centralized logs and traces
- automated backups in Agent-Backend

## Regional Failover Guidance

Use:

- weighted DNS
- active/passive failover
- health-based traffic routing
- replicated persistence layer in Agent-Backend

## Rollback Procedure

1. pause rollout
2. restore previous image digest
3. restore previous Helm release
4. validate readiness
5. validate metrics and latency
6. resume traffic

## Incident Response

During production incidents:

- preserve logs and traces
- snapshot failing workloads
- retain deployment metadata
- capture rollback timestamps
- document customer impact

## Backup Validation

Recommended cadence:

- nightly restore validation
- quarterly disaster recovery exercises
- periodic failover testing
