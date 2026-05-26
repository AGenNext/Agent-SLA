import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
    agent_sla_evaluation_latency: ['p(95)<500'],
    agent_sla_success_rate: ['rate>0.99']
  },
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: Number(__ENV.K6_VUS || 5),
      duration: __ENV.K6_DURATION || '30s'
    }
  }
};

const evaluationLatency = new Trend('agent_sla_evaluation_latency');
const successRate = new Rate('agent_sla_success_rate');
const baseUrl = __ENV.AGENT_SLA_BASE_URL || 'http://localhost:8080';
const token = __ENV.AGENT_SLA_API_TOKEN || '';

const headers = {
  'content-type': 'application/json',
  ...(token ? { authorization: `Bearer ${token}` } : {})
};

export default function () {
  const health = http.get(`${baseUrl}/health`);
  check(health, {
    'health is 200': (res) => res.status === 200
  });

  const payload = JSON.stringify({
    objective: 'performance smoke test',
    target: { availability: 0.99, latencyMs: 500 },
    actual: { availability: 0.999, latencyMs: 120 }
  });

  const started = Date.now();
  const response = http.post(`${baseUrl}/v1/sla/evaluate`, payload, { headers });
  evaluationLatency.add(Date.now() - started);
  const ok = check(response, {
    'evaluate is successful': (res) => res.status >= 200 && res.status < 300
  });
  successRate.add(ok);
  sleep(1);
}
