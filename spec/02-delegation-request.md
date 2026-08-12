# 2. Delegation request

`DelegationRequest` is defined by its schema. `specVersion`, `id`, `objective`, and `authority` are required. IDs are stable within a caller's scope. A retry with the same ID and semantically identical body SHOULD be idempotent; reuse with a different body MUST be rejected.

`constraints` (deadline, timeout, turns, context, priority) govern operation. `budget` (cost, tokens, duration, child count) governs consumption; advertised worker support determines which dimensions can be enforced. A worker MUST reject or request input if a required limit cannot be honored. `resultSchema` constrains worker output only—it does not establish task success.

Parent `depth` begins at 1 for a child. A child allocation comes from the parent's remaining budget; exact reservation and refund accounting is implementation-specific.

OPEN QUESTION: Should unsupported optional budget dimensions be ignored with a warning or require explicit negotiation?
