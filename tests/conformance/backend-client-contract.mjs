import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const openapi = await readFile(new URL('../../openapi/agent-backend-integration.yaml', import.meta.url), 'utf8');
const client = await readFile(new URL('../../packages/sdk-js/src/agent-backend-client.ts', import.meta.url), 'utf8');
const adapter = await readFile(new URL('../../packages/sdk-js/src/backend-adapter.ts', import.meta.url), 'utf8');

const requiredPaths = [
  '/v1/sla/validate',
  '/v1/sla/evaluate',
  '/v1/backend/sla',
  '/v1/backend/audit-events',
  '/v1/backend/metrics',
  '/v1/backend/incidents/events'
];

for (const path of requiredPaths) {
  assert.ok(openapi.includes(path), `OpenAPI contract must define ${path}`);
  assert.ok(client.includes(path), `HTTP client must call ${path}`);
}

const requiredTypes = [
  'AgentSlaBackendAdapter',
  'PersistSlaCommand',
  'PersistedSlaObject',
  'AuditEvent',
  'RegisterMetricCommand',
  'RegisteredMetric',
  'IncidentEvent'
];

for (const typeName of requiredTypes) {
  assert.ok(adapter.includes(typeName), `Adapter contract must define ${typeName}`);
}

console.log('Agent-Backend client contract conformance passed');
