export type AgentSlaValidationResult = {
  valid: boolean;
  errors?: Array<{ path?: string; message: string; code?: string }>;
};

export type AgentSlaEvaluationResult = {
  compliant: boolean;
  score?: number;
  violations?: Array<{ metric: string; expected?: unknown; actual?: unknown; message: string }>;
};

export type PersistSlaCommand = {
  tenantId: string;
  projectId: string;
  actorId: string;
  idempotencyKey: string;
  sla: unknown;
};

export type PersistedSlaObject = {
  id: string;
  tenantId: string;
  projectId: string;
  version: number;
  sla: unknown;
  createdAt: string;
  updatedAt: string;
};

export type AuditEvent = {
  eventId: string;
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  requestId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export type RegisterMetricCommand = {
  tenantId: string;
  projectId: string;
  name: string;
  kind: string;
  unit?: string;
  definition?: unknown;
};

export type RegisteredMetric = {
  id: string;
  tenantId: string;
  projectId: string;
  name: string;
  kind: string;
  unit?: string;
  createdAt: string;
};

export type IncidentEvent = {
  eventId: string;
  tenantId: string;
  incidentId: string;
  type: 'opened' | 'updated' | 'resolved';
  timestamp: string;
  metadata?: Record<string, unknown>;
};

export interface AgentSlaBackendAdapter {
  validateSla(input: unknown): Promise<AgentSlaValidationResult>;
  evaluateSla(input: unknown): Promise<AgentSlaEvaluationResult>;
  persistSlaObject(command: PersistSlaCommand): Promise<PersistedSlaObject>;
  appendAuditEvent(event: AuditEvent): Promise<void>;
  registerMetric(command: RegisterMetricCommand): Promise<RegisteredMetric>;
  recordIncidentEvent(event: IncidentEvent): Promise<void>;
}
