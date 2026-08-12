<!-- docket:backlink:start (generated — do not hand-edit) -->

> ↩ **[Change 0001 — Correct v0.1 authority and event contract consistency](https://github.com/ethanhinson/adp/blob/docket/docs/changes/active/0001-correct-v0-1-contract-consistency.md)**

<!-- docket:backlink:end -->

# Correct v0.1 authority and event contract consistency — results

Change: #0001 · Branch: `feat/correct-v0-1-contract-consistency` · PR: opened after this artifact · Plan: `docs/superpowers/plans/2026-08-12-correct-v0-1-contract-consistency.md` · ADRs: none

## Findings

- Whole-branch review found that `isAuthoritySubset` treated an unrestricted child credential as a subset of a restricted parent. Commit `2137798` added a failing regression and corrected the scope rule.
- Whole-branch review found that the compile-time type fixture had changed the normal build to `noEmit`, preventing package artifacts from reaching `dist/`. Commit `3e05ffc` restored emitted package output and isolated fixture checking in `tsconfig.types.json`.
- The post-fix Node.js 22 gate passed `npm run check`: both TypeScript configurations compiled and all 28 Vitest tests passed.

## Plan deviations

- The plan's final verification heading was reclassified from an implementation task to the build gate because it did not produce a task commit. No implementation scope changed.
