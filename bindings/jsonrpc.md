# Reference JSON-RPC 2.0 binding

This optional mapping carries ADP over JSON-RPC 2.0; it is not the canonical transport. Standard JSON-RPC errors apply, with application error data containing stable `code` values such as `invalid_transition`, `authority_expansion`, and `not_found`.

| Method | Parameters | Result |
|---|---|---|
| `delegate.submit` | `{request: DelegationRequest, idempotencyKey?}` | `{state, acceptedRequest}` |
| `delegate.get` | `{delegationId}` | `{state, lastSequence, result?}` |
| `delegate.observe` | `{delegationId, afterSequence?}` | event stream or ordered event array |
| `delegate.provide_input` | `{delegationId, requestId, input, resumeToken?}` | `{state: "working"}` |
| `delegate.cancel` | `{delegationId, reason?}` | `{state}` |
| `delegate.result` | `{delegationId}` | `DelegationResult` or pending error |
| `artifact.get` | `{delegationId, artifactId}` | transport-specific bytes/reference plus metadata |
| `capabilities.get` | `{}` | `{workers: WorkerDescriptor[]}` |

Submission retry with the same delegation ID/idempotency key and identical content returns the original outcome; different content is rejected. Cancellation and identical `provide_input` retries are idempotent. Observation preserves event sequence and may redeliver events.

```json
{"jsonrpc":"2.0","id":1,"method":"delegate.submit","params":{"request":{"specVersion":"0.1","id":"inspect-1","objective":{"summary":"Inspect parser boundaries"},"authority":{"capabilities":["repository.inspect"],"filesystem":{"read":["/repo/src"],"write":[]},"network":{"mode":"none"},"subprocess":{"allowed":false},"credentials":[],"sideEffects":[],"delegation":{"allowed":false,"maxDepth":0}}}}}
```
```json
{"jsonrpc":"2.0","id":1,"result":{"state":"submitted","acceptedRequest":{"specVersion":"0.1","id":"inspect-1"}}}
```
```json
{"jsonrpc":"2.0","id":2,"method":"delegate.provide_input","params":{"delegationId":"rate-limit-42","requestId":"clock-choice","input":true,"resumeToken":"resume_6ef21cb8235d8f8a"}}
```

Streaming is transport-specific: WebSocket notifications, HTTP streams, polling, queue messages, or callbacks can implement `observe`. A binding must document authentication, limits, and artifact resolution. Tool protocols, agent-to-agent protocols, IDE/client protocols, CLI, HTTP, queues, and in-process APIs can map the same semantics without becoming ADP dependencies.

OPEN QUESTION: A future profile may standardize JSON-RPC streaming and error codes after implementation experience.
