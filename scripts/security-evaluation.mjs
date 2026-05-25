import { readFile } from "node:fs/promises";

const checks = [];

function pass(name, evidence) {
  checks.push({ name, status: "PASS", evidence });
}

function fail(name, evidence) {
  checks.push({ name, status: "FAIL", evidence });
}

async function includes(file, patterns) {
  const text = await readFile(file, "utf8");
  return patterns.every((pattern) => text.includes(pattern));
}

if (await includes("Dockerfile", ["USER node", "HEALTHCHECK", "HOST=0.0.0.0", "--chown=node:node"])) {
  pass("api-container-non-root-healthchecked", "Dockerfile");
} else {
  fail("api-container-non-root-healthchecked", "Dockerfile must run as node, expose healthcheck, and copy node-owned files.");
}

if (await includes("Dockerfile.mcp", ["USER node", "--chown=node:node"])) {
  pass("mcp-container-non-root", "Dockerfile.mcp");
} else {
  fail("mcp-container-non-root", "Dockerfile.mcp must run as node and copy node-owned files.");
}

if (await includes("docker-compose.yml", ["read_only: true", "cap_drop:", "no-new-privileges:true", "/health"])) {
  pass("compose-runtime-restrictions", "docker-compose.yml");
} else {
  fail("compose-runtime-restrictions", "Compose must enforce read-only containers, dropped capabilities, no-new-privileges, and healthchecks.");
}

if (
  await includes("apps/api/src/server.ts", [
    "maxBodyBytes",
    "requestTimeout",
    "headersTimeout",
    "keepAliveTimeout",
    "x-content-type-options",
    "SIGTERM",
    "AGENT_SLA_API_TOKEN",
    "Rate limit exceeded",
    "x-request-id",
    "timingSafeEqual"
  ])
) {
  pass("api-request-hardening", "apps/api/src/server.ts");
} else {
  fail("api-request-hardening", "API server must enforce auth, body limits, timeouts, request IDs, rate limiting, security headers, and graceful shutdown.");
}

if (
  await includes("docs/production.md", [
    "AGENT_SLA_API_TOKEN",
    "CORS_ALLOW_ORIGIN",
    "X-Request-Id",
    "distributed limiter"
  ])
) {
  pass("production-deployment-guidance", "docs/production.md");
} else {
  fail("production-deployment-guidance", "Production documentation must define auth, CORS, request tracing, and distributed rate limiting guidance.");
}

if (await includes(".github/workflows/ci.yml", ["npm audit --audit-level=high", "npm run e2e", "npm run security:evaluate", "docker build"])) {
  pass("ci-security-gates", ".github/workflows/ci.yml");
} else {
  fail("ci-security-gates", "CI must run audit, E2E, security evaluation, and Docker builds.");
}

if (await includes(".github/workflows/release.yml", ["npm run release:verify", "github/codeql-action/analyze", "docker build", "enforce-release"])) {
  pass("release-security-enforcement", ".github/workflows/release.yml");
} else {
  fail("release-security-enforcement", "Release workflow must run release verification, audit, and Docker builds.");
}

const failed = checks.filter((check) => check.status === "FAIL");
console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", checks }, null, 2));

if (failed.length) process.exit(1);
