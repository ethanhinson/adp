# 6. Artifacts

Artifacts are first-class references to files, patches, test reports, structured data, reports, logs, or blobs. Each records media type, URI, SHA-256 digest, byte size, producer delegation, and optionally a workspace-relative path, schema, and metadata. Expected artifact specs give stable IDs and requirements before work begins.

A URI does not imply universal or remote accessibility. Its resolution, authorization, expiry, and transfer belong to the runtime/transport. Consumers MUST verify digest and size when retrieving untrusted artifacts and MUST treat media type and filename as claims. Child-produced artifacts retain the child's producer ID even when included by a parent.

OPEN QUESTION: v0.1 standardizes only SHA-256; future digest agility should avoid weakening verification.
