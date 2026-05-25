import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { handleRequest } from "./handler.js";

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "127.0.0.1";
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES ?? 1_048_576);
const apiToken = process.env.AGENT_SLA_API_TOKEN;
const corsOrigin = process.env.CORS_ALLOW_ORIGIN;
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
const rateLimitMaxRequests = Number(process.env.RATE_LIMIT_MAX_REQUESTS ?? 120);
const trustedProxyHeader = process.env.TRUSTED_CLIENT_IP_HEADER?.toLowerCase();

const securityHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "permissions-policy": "geolocation=(), microphone=(), camera=()",
  "cross-origin-resource-policy": "same-origin"
};

const publicPaths = new Set(["/health", "/ready"]);
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function requestHeaders() {
  return corsOrigin ? { ...securityHeaders, "access-control-allow-origin": corsOrigin, vary: "Origin" } : securityHeaders;
}

function logEvent(event: Record<string, unknown>) {
  console.log(JSON.stringify({ service: "agent-sla-api", timestamp: new Date().toISOString(), ...event }));
}

function writeJson(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, requestHeaders());
  response.end(JSON.stringify(body));
}

function getClientId(request: IncomingMessage) {
  if (trustedProxyHeader) {
    const header = request.headers[trustedProxyHeader];
    if (typeof header === "string" && header.trim()) return header.split(",")[0].trim();
  }
  return request.socket.remoteAddress ?? "unknown";
}

function getTraceparent(request: IncomingMessage) {
  const traceparent = request.headers.traceparent;
  return typeof traceparent === "string" ? traceparent : undefined;
}

function rateLimit(request: IncomingMessage) {
  const now = Date.now();
  const clientId = getClientId(request);
  const bucket = rateLimitBuckets.get(clientId);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(clientId, { count: 1, resetAt: now + rateLimitWindowMs });
    return { limited: false, resetAt: now + rateLimitWindowMs };
  }
  bucket.count += 1;
  return { limited: bucket.count > rateLimitMaxRequests, resetAt: bucket.resetAt };
}

function authorized(request: IncomingMessage, pathname: string) {
  if (publicPaths.has(pathname)) return true;
  if (!apiToken) return process.env.NODE_ENV !== "production";
  const authorization = request.headers.authorization ?? "";
  const expected = `Bearer ${apiToken}`;
  const provided = Array.isArray(authorization) ? authorization[0] : authorization;
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

function readJson(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      if (raw.length + chunk.length > maxBodyBytes) {
        reject(new Error(`Request body exceeds ${maxBodyBytes} bytes.`));
        request.destroy();
        return;
      }
      raw += chunk;
    });
    request.on("end", () => {
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

export const server = createServer(async (request, response) => {
  const startedAt = performance.now();
  const requestId = randomUUID();
  const clientId = getClientId(request);
  const traceparent = getTraceparent(request);
  response.setHeader("x-request-id", requestId);
  if (traceparent) response.setHeader("traceparent", traceparent);
  let status = 500;
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "OPTIONS") {
      status = 204;
      response.writeHead(status, {
        ...requestHeaders(),
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "authorization,content-type,traceparent,tracestate",
        "access-control-max-age": "600"
      });
      response.end();
      return;
    }
    const limit = rateLimit(request);
    if (limit.limited) {
      status = 429;
      response.setHeader("retry-after", Math.ceil((limit.resetAt - Date.now()) / 1000));
      writeJson(response, status, { error: "Rate limit exceeded", requestId });
      return;
    }
    if (!authorized(request, url.pathname)) {
      status = 401;
      writeJson(response, status, { error: "Unauthorized", requestId });
      return;
    }
    const body = request.method === "GET" ? undefined : await readJson(request);
    const result = await handleRequest(request.method ?? "GET", url.pathname, body);
    status = result.status;
    writeJson(response, status, result.body);
  } catch (error) {
    status = 400;
    writeJson(response, status, { error: error instanceof Error ? error.message : String(error), requestId });
  } finally {
    logEvent({
      event: "http_request",
      requestId,
      traceparent,
      method: request.method ?? "GET",
      path: request.url?.split("?")[0] ?? "/",
      status,
      clientId,
      durationMs: Math.round((performance.now() - startedAt) * 100) / 100
    });
  }
});

server.requestTimeout = Number(process.env.REQUEST_TIMEOUT_MS ?? 30_000);
server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS ?? 35_000);
server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT_MS ?? 5_000);

function shutdown(signal: NodeJS.Signals) {
  logEvent({ event: "shutdown", signal });
  server.close((error) => {
    if (error) {
      console.error(JSON.stringify({ service: "agent-sla-api", timestamp: new Date().toISOString(), event: "shutdown_error", error: error.message }));
      process.exit(1);
    }
    process.exit(0);
  });
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(port, host, () => {
    logEvent({ event: "startup", url: `http://${host}:${port}` });
  });
}
