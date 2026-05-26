import type {
  AgentSlaBackendAdapter,
  AgentSlaEvaluationResult,
  AgentSlaValidationResult,
  AuditEvent,
  IncidentEvent,
  PersistSlaCommand,
  PersistedSlaObject,
  RegisterMetricCommand,
  RegisteredMetric
} from './backend-adapter.js';

export type AgentBackendClientOptions = {
  baseUrl: string;
  apiToken?: string;
  fetchImpl?: typeof fetch;
};

export class AgentBackendHttpClient implements AgentSlaBackendAdapter {
  private readonly baseUrl: string;
  private readonly apiToken?: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AgentBackendClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.apiToken = options.apiToken;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  async validateSla(input: unknown): Promise<AgentSlaValidationResult> {
    return this.request('/v1/sla/validate', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async evaluateSla(input: unknown): Promise<AgentSlaEvaluationResult> {
    return this.request('/v1/sla/evaluate', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  }

  async persistSlaObject(command: PersistSlaCommand): Promise<PersistedSlaObject> {
    return this.request('/v1/backend/sla', {
      method: 'POST',
      body: JSON.stringify(command)
    });
  }

  async appendAuditEvent(event: AuditEvent): Promise<void> {
    await this.request('/v1/backend/audit-events', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  async registerMetric(command: RegisterMetricCommand): Promise<RegisteredMetric> {
    return this.request('/v1/backend/metrics', {
      method: 'POST',
      body: JSON.stringify(command)
    });
  }

  async recordIncidentEvent(event: IncidentEvent): Promise<void> {
    await this.request('/v1/backend/incidents/events', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        ...(this.apiToken ? { authorization: `Bearer ${this.apiToken}` } : {}),
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Agent-Backend request failed (${response.status}): ${body}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}
