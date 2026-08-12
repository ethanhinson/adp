---
id: 1
slug: correct-v0-1-contract-consistency
title: Correct v0.1 authority and event contract consistency
status: in-progress
priority: high
type: fix
created: 2026-08-12
updated: 2026-08-12
depends_on: []
related: []
discovered_from: []
adrs: []
spec: docs/superpowers/specs/2026-08-12-correct-v0-1-contract-consistency-design.md
plan:
results:
trivial: false
auto_groomable:
branch: feat/correct-v0-1-contract-consistency
pr:
blocked_by:
reconciled: false
claimed_at: 2026-08-12T05:30:36Z
---

## Artifacts

<!-- docket:artifacts:start (generated — do not hand-edit) -->
| Artifact | Link |
|---|---|
| Spec | [2026-08-12-correct-v0-1-contract-consistency-design.md](https://github.com/ethanhinson/adp/blob/docket/docs/superpowers/specs/2026-08-12-correct-v0-1-contract-consistency-design.md) |
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
