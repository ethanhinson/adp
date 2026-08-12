# 11. Transports and versioning

ADP defines semantics, not framing. A binding MUST preserve request identity, lifecycle ordering, structured errors, suspension/resume, cancellation, and artifact references. It SHOULD state authentication, retries, idempotency, observation resumption, payload limits, and artifact resolution.

The included JSON-RPC mapping is illustrative, not canonical. CLI commands, HTTP, queues, in-process APIs, tool protocols, IDE/client protocols, and agent-to-agent adapters may carry ADP without becoming repository dependencies.

All v0.1 canonical documents use `specVersion: "0.1"`. Unknown required fields are rejected by canonical schemas; optional extension strings go in namespaced `metadata` keys. Implementations MUST negotiate or reject unsupported versions, and MUST NOT infer compatibility from a numerically similar version.

OPEN QUESTION: Extension negotiation and rules for ignorable fields need interoperability evidence.
