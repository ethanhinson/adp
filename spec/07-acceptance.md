# 7. Acceptance

Acceptance criteria are independent of `resultSchema`. They cover command/test expectations, required artifacts, schema validation, assertions/properties, external evaluators, and human approval. Every criterion has an ID and may name an evaluator. Results are `passed`, `failed`, `not_run`, or `needs_review` and may cite artifact evidence.

A worker's claim of completion is not proof that criteria passed. Workers may evaluate suitable criteria, callers SHOULD repeat deterministic checks when possible, and external/human criteria remain reviewable. Required failed, not-run, or needs-review criteria normally prevent caller acceptance even if worker status is `completed`; caller policy decides the final disposition.

For the coding example, `npm test` is a command criterion and its machine-readable report is evidence. Coverage of burst/refill behavior is a caller assertion, preventing a green but irrelevant test suite from being sufficient.

OPEN QUESTION: A future version may standardize an aggregate caller acceptance decision; v0.1 only reports per-criterion judgments.
