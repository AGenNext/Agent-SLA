# Design Log

## 2026-05-25

Decision: implement Agent-SLA in `/Users/apple/Agent-SLA`, not in
`/Users/apple/Documents/New project`.

Evidence:

- `AGenNext/Agent-SLA` is the requested target product repository.
- `/Users/apple/Documents/New project` is an unrelated Expo app with an
  AgentAid remote.
- User clarified that `Agent-Backend` is the DB and runtime layer.

Result:

- Agent-SLA owns DSL, SDKs, API facade, MCP server, and skill.
- Agent-Backend remains the future runtime and persistence integration target.
