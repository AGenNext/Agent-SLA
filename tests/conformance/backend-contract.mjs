import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const contract = await readFile(new URL('../../openapi/agent-backend-integration.yaml', import.meta.url), 'utf8');

assert.match(contract, /\/v1\/sla\/validate:/, 'OpenAPI contract must define validate endpoint');
assert.match(contract, /\/v1\/sla\/evaluate:/, 'OpenAPI contract must define evaluate endpoint');
assert.match(contract, /\/v1\/backend\/sla:/, 'OpenAPI contract must define persistence endpoint');
assert.match(contract, /PersistSlaCommand/, 'OpenAPI contract must define persistence schema');
assert.match(contract, /AuditEvent/, 'OpenAPI contract must define audit event schema');
assert.match(contract, /IncidentEvent/, 'OpenAPI contract must define incident event schema');

console.log('Agent-Backend integration contract conformance passed');
