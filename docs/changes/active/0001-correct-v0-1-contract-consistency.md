---
id: 1
slug: correct-v0-1-contract-consistency
title: Correct v0.1 authority and event contract consistency
status: implemented
priority: high
type: fix
created: 2026-08-12
updated: 2026-08-12
depends_on: []
related: []
discovered_from: []
adrs: []
spec: docs/superpowers/specs/2026-08-12-correct-v0-1-contract-consistency-design.md
plan: docs/superpowers/plans/2026-08-12-correct-v0-1-contract-consistency.md
results: docs/results/2026-08-12-correct-v0-1-contract-consistency-results.md
trivial: false
auto_groomable:
branch: feat/correct-v0-1-contract-consistency
pr: https://github.com/ethanhinson/adp/pull/1
blocked_by:
reconciled: true
claimed_at: 2026-08-12T05:50:21Z
---

## Artifacts

<!-- docket:artifacts:start (generated — do not hand-edit) -->
| Artifact | Link |
|---|---|
| Spec | [2026-08-12-correct-v0-1-contract-consistency-design.md](https://github.com/ethanhinson/adp/blob/docket/docs/superpowers/specs/2026-08-12-correct-v0-1-contract-consistency-design.md) |
| Plan | [2026-08-12-correct-v0-1-contract-consistency.md](https://github.com/ethanhinson/adp/blob/feat/correct-v0-1-contract-consistency/docs/superpowers/plans/2026-08-12-correct-v0-1-contract-consistency.md) |
| Results | [2026-08-12-correct-v0-1-contract-consistency-results.md](https://github.com/ethanhinson/adp/blob/feat/correct-v0-1-contract-consistency/docs/results/2026-08-12-correct-v0-1-contract-consistency-results.md) |
| PR | [#1](https://github.com/ethanhinson/adp/pull/1) |
<!-- docket:artifacts:end -->

## Why

The v0.1 review found cases where the reference authority helper can either discard valid filesystem access or broaden security constraints, and where a terminal lifecycle event can contradict its embedded result while still passing schema validation. The exported TypeScript types also do not consistently represent the canonical schemas. These gaps undermine the protocol's central promise of bounded, monotonically decreasing authority and unambiguous structured boundaries.

## What changes

- Correct filesystem, credential-scope, and approval authority semantics.
- Require terminal event kinds to agree with their embedded result statuses.
- Bring public TypeScript types into alignment with the canonical JSON Schemas.
- Clarify the affected normative semantics and add adversarial regression tests.
- Verify the complete project under its declared Node.js 22+ runtime.

## Out of scope

- Generating TypeScript declarations from JSON Schema.
- Adding a general cross-document semantic validation engine.
- Turning the reference helper into a runtime security boundary.
- Expanding v0.1 with new authority dimensions, lifecycle states, or transport behavior.

## Open questions

None. The approved design resolves the reviewed semantics explicitly.

## Reconcile log

<!-- Appended by docket-implement-next's reconcile pass: dated entries of what changed. -->

### 2026-08-12

Re-checked the approved design against `main`, the current schemas, reference TypeScript, tests, related and archived changes, and ADRs. The five documented contract defects remain present and no overlapping work, dependencies, or newer architecture decisions alter the scope. The approved spec remains current without modification.
