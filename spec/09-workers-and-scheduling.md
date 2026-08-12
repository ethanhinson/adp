# 9. Workers and scheduling

`WorkerDescriptor` advertises capabilities, maximum authority, locality, workspace modes, features, supported budget dimensions, optionally visible model descriptors, and a transient capacity snapshot. Worker, model, and provider are separate concepts; a worker may select among models or reveal none.

A request's scheduling requirements express required/preferred capabilities, trust, locality, workspace/context needs, latency, cost, and optional provider/model restrictions. The scheduler selects a compatible worker and returns ordinary acceptance/rejection lifecycle state; ADP does not define an algorithm, queue, or placement service. Descriptors are claims and SHOULD be authenticated and refreshed where trust matters.

Nested delegations carry parent ID, parent worker identity when known, and depth. They attenuate authority, subdivide remaining budget, preserve child artifact provenance, and permit traceability. Parent cancellation SHOULD propagate as described by lifecycle rules.

OPEN QUESTION: Capability naming needs experience across independent implementations before a registry is justified.
