# 10. Security

> **Prompts express desired behavior. Runtime enforcement establishes security boundaries.**

Apply least authority and deny ambient capabilities. Canonicalize filesystem roots and block traversal, symlink, alternate-encoding, and workspace escapes. Enforce network egress and subprocess command/argument policy outside the worker. Pass credentials only through scoped opaque handles; never embed values in requests, context, artifacts, diagnostics, logs, or telemetry. External side effects need explicit grants and, where specified, approvals.

At every nested delegation, recompute intersection to prevent escalation. Bind authority to the caller and objective to limit confused-deputy attacks. Treat caller context, worker output, retrieved artifacts, filenames, media types, patches, and logs as untrusted. Scan or isolate artifacts before interpretation/execution. Acceptance evidence must be independently attributable and integrity-checked; a worker can spoof its own assertions.

Submission IDs, event sequences, and input request IDs support replay detection and idempotency. Resume tokens require confidentiality, narrow scope, expiry, and single-use or replay-safe handling. Redact secrets from observability data and apply retention limits.

An ADP-compliant request describing a restriction does not prove a runtime enforces it. Data/protocol conformance and security certification are distinct. Prompt compliance is never evidence of sandboxing.

OPEN QUESTION: Authentication, signatures, trust roots, and security assurance profiles are transport/deployment concerns not standardized in v0.1.
