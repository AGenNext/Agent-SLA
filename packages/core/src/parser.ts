import { AgentSLA } from "./types.js";
import { validateSLA } from "./validator.js";

export function parseSLA(input: string | unknown): AgentSLA {
  const parsed = typeof input === "string" ? JSON.parse(input) : input;
  const result = validateSLA(parsed);
  if (!result.valid) {
    const details = result.errors.map((error) => `${error.code} at ${error.path}: ${error.message}`).join("; ");
    throw new Error(`Invalid AgentSLA: ${details}`);
  }
  return parsed as AgentSLA;
}
