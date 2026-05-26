import assert from 'node:assert/strict';

const baseUrl = process.env.AGENT_SLA_BASE_URL || 'http://localhost:8080';

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  return {
    status: response.status,
    headers: response.headers,
    body: await response.text()
  };
}

const health = await request('/health');
assert.equal(health.status, 200, 'health endpoint must return 200');

const ready = await request('/ready');
assert.equal(ready.status, 200, 'ready endpoint must return 200');

const metrics = await request('/metrics');
assert.equal(metrics.status, 200, 'metrics endpoint must return 200');
assert.match(metrics.body, /agent_sla_http_requests_total/, 'metrics output must expose request metrics');

const unauthorized = await request('/v1/sla/evaluate', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ objective: 'conformance test' })
});

if (process.env.NODE_ENV === 'production') {
  assert.equal(unauthorized.status, 401, 'production deployments must require auth');
}

console.log('runtime conformance suite passed');
