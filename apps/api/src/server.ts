import { createServer, IncomingMessage } from "node:http";
import { handleRequest } from "./handler.js";

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? "127.0.0.1";
const maxBodyBytes = Number(process.env.MAX_BODY_BYTES ?? 1_048_576);

const securityHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
  "permissions-policy": "geolocation=(), microphone=(), camera=()",
  "cross-origin-resource-policy": "same-origin"
};

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
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        ...securityHeaders,
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type"
      });
      response.end();
      return;
    }
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const body = request.method === "GET" ? undefined : await readJson(request);
    const result = await handleRequest(request.method ?? "GET", url.pathname, body);
    response.writeHead(result.status, securityHeaders);
    response.end(JSON.stringify(result.body));
  } catch (error) {
    response.writeHead(400, securityHeaders);
    response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
  }
});

server.requestTimeout = Number(process.env.REQUEST_TIMEOUT_MS ?? 30_000);
server.headersTimeout = Number(process.env.HEADERS_TIMEOUT_MS ?? 35_000);
server.keepAliveTimeout = Number(process.env.KEEP_ALIVE_TIMEOUT_MS ?? 5_000);

function shutdown(signal: NodeJS.Signals) {
  console.log(`Agent-SLA API received ${signal}; closing server.`);
  server.close((error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

if (import.meta.url === `file://${process.argv[1]}`) {
  server.listen(port, host, () => {
    console.log(`Agent-SLA API listening on http://${host}:${port}`);
  });
}
