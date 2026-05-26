import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const example = await readFile(new URL('../../examples/agent-backend-integration/server.ts', import.meta.url), 'utf8');

const requiredRoutes = [
  '/v1/sla/validate',
  '/v1/sla/evaluate',
  '/v1/backend/sla',
  '/v1/backend/audit-events',
  '/v1/backend/metrics',
  '/v1/backend/incidents/events'
];

for (const route of requiredRoutes) {
  assert.ok(example.includes(route), `Example backend server must expose ${route}`);
}

assert.ok(example.includes('validateSLA'), 'Example backend server must integrate validateSLA');
assert.ok(example.includes('evaluateSLA'), 'Example backend server must integrate evaluateSLA');

console.log('Agent-Backend example integration contract passed');
