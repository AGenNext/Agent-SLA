# SDKs

Agent-SLA provides mirrored SDK surfaces for JavaScript, Python, and Rust.

## Core Verbs

- JavaScript: `parseSLA`, `validateSLA`, `evaluateSLA`, `explainSLA`,
  `listQualityModel`, `getAgentSLAJsonSchema`.
- Python: `parse_sla`, `validate_sla`, `evaluate_sla`, `explain_sla`.
- Rust: `parse_sla`, `validate_sla`, `evaluate_sla`, `explain_sla`.

## JavaScript

```bash
npm install
npm run build --workspace @agennext/agent-sla-sdk-js
```

```js
import { validateSLA, evaluateSLA, getAgentSLAJsonSchema } from "@agennext/agent-sla-sdk-js";

const validation = validateSLA(sla);
const evaluation = evaluateSLA(sla, { "AVG TTFT": 0.5 });
const schema = getAgentSLAJsonSchema();
```

## Python

```bash
PYTHONPATH=packages/sdk-python python3 -m unittest discover packages/sdk-python/tests
```

```python
from agent_sla import validate_sla, evaluate_sla

validation = validate_sla(sla)
evaluation = evaluate_sla(sla, {"AVG TTFT": 0.5})
```

## Rust

```bash
cargo test --manifest-path packages/sdk-rust/Cargo.toml
```

```rust
let sla = agent_sla::parse_sla(json_text)?;
let errors = agent_sla::validate_sla(&sla);
```

## Metric Compatibility

All SDKs accept the same Table 2 metric identifiers. Keep the TypeScript,
Python, and Rust metric registries aligned when adding or renaming metrics.

## Runtime Boundary

SDK evaluators accept metric snapshots or provider callbacks. They do not own
storage. Production metric history, live updates, audit events, and SurrealDB
persistence should be implemented through Agent-Backend adapters.
