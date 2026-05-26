import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { validateSLA, evaluateSLA } from '@agennext/agent-sla-sdk-js';

type JsonResponse = { status: number; body?: unknown };

const port = Number(process.env.PORT ?? 8090);
const apiToken = process.env.AGENT_BACKEND_API_TOKEN;

const slaStore = new Map<string, unknown>();
const auditEvents: unknown[] = [];
const metrics = new Map<string, unknown>();
const incidentEvents: unknown[] = [];

function readJson(request: NodeJS.ReadableStream) {
  return new Promise<unknown>((resolve, reject) => {
    let raw = '';
    request.on('data', (chunk) => {
      raw += chunk;
    });
    request.on('end', () => {
      if (!raw) resolve(undefined);
      else {
        try {
          resolve(JSON.parse(raw));
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

function authorized(headers: Record<string, string | string[] | undefined>) {
  if (!apiToken) return true;
  return headers.authorization === `Bearer ${apiToken}`;
}

async function route(method: string, pathname: string, body: unknown): Promise<JsonResponse> {
  if (method === 'POST' && pathname === '/v1/sla/validate') {
    return { status: 200, body: validateSLA(body) };
  }

  if (method === 'POST' && pathname === '/v1/sla/evaluate') {
    return { status: 200, body: evaluateSLA(body as never, {}) };
  }

  if (method === 'POST' && pathname === '/v1/backend/sla') {
    const command = body as { tenantId: string; projectId: string; sla: unknown };
    const now = new Date().toISOString();
    const persisted = {
      id: randomUUID(),
      tenantId: command.tenantId,
      projectId: command.projectId,
      version: 1,
      sla: command.sla,
      createdAt: now,
      updatedAt: now
    };
    slaStore.set(persisted.id, persisted);
    return { status: 200, body: persisted };
  }

  if (method === 'POST' && pathname === '/v1/backend/audit-events') {
    auditEvents.push(body);
    return { status: 204 };
  }

  if (method === 'POST' && pathname === '/v1/backend/metrics') {
    const command = body as { tenantId: string; projectId: string; name: string; kind: string; unit?: string };
    const registered = { id: randomUUID(), ...command, createdAt: new Date().toISOString() };
    metrics.set(registered.id, registered);
    return { status: 200, body: registered };
  }

  if (method === 'POST' && pathname === '/v1/backend/incidents/events') {
    incidentEvents.push(body);
    return { status: 204 };
  }

  return { status: 404, body: { error: 'Not found' } };
}

export const server = createServer(async (request, response) => {
  try {
    if (!authorized(request.headers)) {
      response.writeHead(401, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
    const body = request.method === 'GET' ? undefined : await readJson(request);
    const result = await route(request.method ?? 'GET', url.pathname, body);
    response.writeHead(result.status, { 'content-type': 'application/json' });
    response.end(result.status === 204 ? undefined : JSON.stringify(result.body));
  } catch (error) {
    response.writeHead(400, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
  }
});

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(port, () => {
    console.log(`Agent-Backend integration example listening on :${port}`);
  });
}
