import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { callTool, tools } from "./tools.js";

interface JsonRpcRequest {
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

function write(message: unknown) {
  output.write(`${JSON.stringify(message)}\n`);
}

export async function handleJsonRpc(request: JsonRpcRequest) {
  if (request.method === "tools/list") {
    return {
      tools: tools.map((name) => ({
        name,
        description: `AgentSLA ${name.replaceAll("_", " ")} tool`,
        inputSchema: { type: "object", additionalProperties: true }
      }))
    };
  }
  if (request.method === "tools/call") {
    const name = String(request.params?.name);
    const args = (request.params?.arguments as Record<string, unknown>) ?? {};
    return { content: [{ type: "text", text: JSON.stringify(await callTool(name, args)) }] };
  }
  throw new Error(`Unsupported method: ${request.method}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rl = createInterface({ input });
  for await (const line of rl) {
    try {
      const request = JSON.parse(line) as JsonRpcRequest;
      const result = await handleJsonRpc(request);
      write({ jsonrpc: "2.0", id: request.id, result });
    } catch (error) {
      write({ jsonrpc: "2.0", error: { code: -32000, message: error instanceof Error ? error.message : String(error) } });
    }
  }
}
