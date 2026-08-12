# Agent Delegation Protocol (ADP)

Most agent integrations ultimately reduce delegation to something like `prompt(worker, text)`. Autonomous delegation needs more: the assignment, permitted actions, location, limits, proof of success, and returned materials must all be explicit.

ADP is an experimental, transport-neutral semantic contract for bounded, verifiable work between autonomous agents or runtimes.

```text
Delegation                         Result
  objective                         status
  authority                         structured output
  workspace        -> Worker ->     artifacts
  constraints                       acceptance evidence
  budget                            usage
  acceptance criteria
  expected artifacts
```

```json
{
  "specVersion": "0.1",
  "id": "review-17",
  "objective": { "summary": "Review the parser for unsafe recursion" },
  "workspace": { "uri": "file:///work/repo", "mode": "read_only" },
  "authority": {
    "capabilities": ["repository.inspect"],
    "filesystem": { "read": ["/work/repo/src/parser"], "write": [] },
    "network": { "mode": "none" },
    "subprocess": { "allowed": false },
    "credentials": [], "sideEffects": [],
    "delegation": { "allowed": false, "maxDepth": 0 }
  },
  "expectedArtifacts": [{ "id": "review", "kind": "report", "required": true }]
}
```

ADP is a semantic contract that is transport-, runtime-, model-, and provider-neutral, intended for bounded agent-to-agent work. It is not an agent runtime, model API, tool protocol, scheduler, sandbox, security implementation, or requirement to expose chain-of-thought. The specification and JSON Schemas are authoritative; TypeScript is reference tooling only.

## Try it

Requires Node.js 22+.

```sh
npm install
npm test
npm run build
```

Start with [the overview](spec/00-overview.md), then inspect [the coding request](examples/coding-task.request.json), [result](examples/coding-task.result.json), and [JSON-RPC mapping](bindings/jsonrpc.md). Schemas use JSON Schema 2020-12. Extension data belongs in string-valued `metadata`, preferably under namespaced keys.

## Design principles

- Delegation over prompting; least and monotonically decreasing authority.
- Evidence over claims; acceptance is separate from output shape.
- Opaque workers and structured boundaries, without hidden reasoning disclosure.
- Runtime and transport independence; implementations choose enforcement and machinery.

**Experimental notice:** ADP v0.1 is an experimental proposal intended to validate the delegation abstraction across multiple runtimes and transports before attempting standardization. It is not an established industry standard.

Licensed under Apache-2.0. See [CONTRIBUTING.md](CONTRIBUTING.md) and [SECURITY.md](SECURITY.md).
