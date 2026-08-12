<!-- docket:backlink:start (generated — do not hand-edit) -->
> ↩ **[Change 0001 — Correct v0.1 authority and event contract consistency](https://github.com/ethanhinson/adp/blob/docket/docs/changes/active/0001-correct-v0-1-contract-consistency.md)**
<!-- docket:backlink:end -->

# Correct v0.1 Contract Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the reference authority algebra, terminal event validation, and exported TypeScript declarations so they consistently implement ADP v0.1's canonical contracts.

**Architecture:** Keep JSON Schema and the normative specification authoritative while making the small TypeScript helper conservative and order-independent. Add focused runtime/schema regressions plus a compile-only public-type fixture, then verify the entire Node.js 22+ project.

**Tech Stack:** Node.js 22+, TypeScript 5.7, Vitest 4, AJV 8, JSON Schema draft 2020-12.

## Global Constraints

- Preserve all existing exported function and type names and the v0.1 wire format.
- Do not add schema generation, cross-event sequence validation, path canonicalization, sandbox enforcement, or new protocol fields.
- Treat schemas and `spec/` as normative; the helper remains reference tooling, not a security boundary.
- Every behavior change follows red-green TDD and the complete `npm run check` suite must pass on Node.js 22+.

---

### Task 1: Make authority intersection monotonic and order-independent

**Files:**
- Modify: `test/authority.test.ts`
- Modify: `src/authority.ts`
- Modify: `spec/04-authority.md`

**Interfaces:**
- Consumes: `Authority`, `CredentialGrant`, and `NetworkAuthority` from `src/types.ts`.
- Produces: unchanged `intersectAuthority(parent, grant, runtimePolicy, workerMaximum): Authority` and `isAuthoritySubset(child, parent): boolean` APIs with corrected filesystem, credential, and approval semantics.

- [ ] **Step 1: Write failing authority regressions**

Add focused Vitest cases that assert:

```ts
expect(intersectAuthority(
  auth({filesystem:{read:["/repo"],write:["/repo"]}}),
  auth({filesystem:{read:["/repo/src"],write:["/repo/src"]}}),
  auth(), auth()
).filesystem).toEqual({read:["/repo/src"],write:["/repo/src"]});

expect(intersectAuthority(
  auth({credentials:[{handle:"secret:a"}]}),
  auth({credentials:[{handle:"secret:a",scopes:["read","write"]}]}),
  auth({credentials:[{handle:"secret:a",scopes:["read"]}]}),
  auth({credentials:[{handle:"secret:a"}]})
).credentials).toEqual([{handle:"secret:a",scopes:["read"]}]);

expect(intersectAuthority(
  auth({approvals:[{action:"deploy",required:true}]}),
  auth({approvals:[]}), auth(), auth()
).approvals).toEqual([{action:"deploy",required:true}]);

expect(isAuthoritySubset(
  auth({approvals:[]}),
  auth({approvals:[{action:"deploy",required:true}]})
)).toBe(false);
```

Also cover reversed filesystem input order, redundant descendant removal, empty explicit scope intersection removing a credential, unrestricted scopes when all sources omit them, and stricter child approvals being allowed.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- test/authority.test.ts`

Expected: FAIL on the newly asserted filesystem, credential, and approval behaviors.

- [ ] **Step 3: Implement the minimal authority corrections**

In `src/authority.ts`:

- derive filesystem candidates from every input, keep a candidate only when every authority covers it, deduplicate candidates, then remove descendants already covered by a retained broader candidate;
- for credentials, require the handle in every source, intersect only explicitly present scope arrays, preserve omitted `scopes` only if no source restricts the handle, and drop handles whose explicit intersection is empty;
- union all actions whose approval entry has `required: true`; and
- extend subset checking so every approval required by the parent is also required by the child.

Keep exact-string behavior for capabilities, destinations, commands, side effects, and scopes.

- [ ] **Step 4: Document the corrected normative rules**

Update `spec/04-authority.md` to state that roots cover descendants and intersection retains the roots accepted by every input; omitted credential scopes mean unrestricted scopes for that handle; explicit scope lists intersect; and required approvals accumulate and cannot be weakened.

- [ ] **Step 5: Run the focused test and verify it passes**

Run: `npm test -- test/authority.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the authority deliverable**

```bash
git add test/authority.test.ts src/authority.ts spec/04-authority.md
git commit -m "fix: make authority intersection monotonic"
```

### Task 2: Enforce terminal event/result agreement

**Files:**
- Modify: `schema/delegation-event.schema.json`
- Modify: `test/schema.test.ts`
- Modify: `spec/03-lifecycle.md`

**Interfaces:**
- Consumes: the existing `delegation-result.schema.json` reference and terminal kinds `completed | partial | failed | cancelled | budget_exhausted | rejected`.
- Produces: a `DelegationEvent` schema whose terminal `kind` requires `result.status` to be the same literal status.

- [ ] **Step 1: Write the failing schema matrix**

In `test/schema.test.ts`, compile the event schema through the existing validator setup and add a table-driven test over all six terminal statuses. For each status, validate a complete event whose `kind` and `result.status` match, then change `result.status` to a different terminal value and assert rejection:

```ts
for (const status of ["completed","partial","failed","cancelled","budget_exhausted","rejected"] as const) {
  const event = {specVersion:"0.1",delegationId:"d1",sequence:1,time:"2026-08-12T00:00:00Z",kind:status,result:{specVersion:"0.1",delegationId:"d1",status}};
  expect(validate("delegation-event.schema.json", event).valid).toBe(true);
  expect(validate("delegation-event.schema.json", {...event,result:{...event.result,status:status === "failed" ? "completed" : "failed"}}).valid).toBe(false);
}
```

Adapt the call to the test file's existing validation helper rather than introducing another AJV instance.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `npm test -- test/schema.test.ts`

Expected: FAIL because mismatched terminal statuses currently validate.

- [ ] **Step 3: Add literal status conditionals**

Replace the broad terminal conditional in `schema/delegation-event.schema.json` with one conditional per terminal kind. Each `then` must both require `result` and constrain it as:

```json
{"properties":{"result":{"allOf":[{"$ref":"delegation-result.schema.json"},{"properties":{"status":{"const":"completed"}}}]}}},"required":["result"]}
```

Use the corresponding literal for each of the six kinds. Preserve the existing `input_required` rule and public event shape.

- [ ] **Step 4: Clarify terminal event semantics**

Update `spec/03-lifecycle.md` to state that a terminal event's embedded result is required and its `status` MUST equal the event `kind`; sequence-level validation remains a runtime responsibility.

- [ ] **Step 5: Run the focused test and verify it passes**

Run: `npm test -- test/schema.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the terminal-event deliverable**

```bash
git add schema/delegation-event.schema.json test/schema.test.ts spec/03-lifecycle.md
git commit -m "fix: bind terminal events to result status"
```

### Task 3: Align exported TypeScript declarations to the schemas

**Files:**
- Modify: `src/types.ts`
- Create: `test/types.fixture.ts`
- Modify: `tsconfig.json`

**Interfaces:**
- Consumes: all published JSON Schemas under `schema/`.
- Produces: precise exported structures for JSON Schema values, artifact kinds/specs, context, constraints, budgets, scheduling, usage, diagnostics, workspaces, and complete worker descriptors while retaining the existing top-level exported names.

- [ ] **Step 1: Add a compile-time public contract fixture**

Create `test/types.fixture.ts` with representative values typed as `DelegationRequest`, `DelegationResult`, `InputRequired`, `Artifact`, and `WorkerDescriptor`. Exercise every schema-defined nested field, including `schema: true`, all worker descriptor fields (`supportedBudgetDimensions`, `models`, and `capacity`), workspace `environment` and `retention`, concrete scheduling, budget, usage, diagnostic, context, and artifact-spec values. Add `@ts-expect-error` assertions for an invalid artifact kind, evaluator, workspace mode, budget dimension, and unknown supported feature.

Ensure `tsconfig.json` includes the fixture in normal `npm run build` compilation without emitting tests into the package output.

- [ ] **Step 2: Run the TypeScript build and verify it fails**

Run: `npm run build`

Expected: FAIL because the current declarations omit fields or use broader placeholder types that make one or more `@ts-expect-error` directives unused.

- [ ] **Step 3: Define schema-aligned reusable types**

In `src/types.ts`, add and use named structures equivalent to the canonical schemas, including:

```ts
export type JsonSchema = Record<string, unknown> | boolean;
export type ArtifactKind = "file" | "patch" | "test_report" | "structured_data" | "report" | "log" | "blob";
export type Evaluator = "worker" | "caller" | "external" | "human";
export type WorkspaceMode = "shared" | "read_only" | "worktree" | "sandbox" | "remote";
export type BudgetDimension = "cost" | "inputTokens" | "outputTokens" | "totalTokens" | "wallClockMs" | "childDelegations";
```

Model `ContextEntry`, `Constraints`, `Budget`, `ArtifactSpec`, `Scheduling`, `Usage`, `Diagnostic`, `WorkspaceEnvironment`, `WorkspaceRetention`, `WorkerFeatures`, `WorkerModel`, and `WorkerCapacity` with exactly the published property names. Change schema-valued fields to `JsonSchema`; narrow artifact kinds/evaluators/workspace modes; and add all missing worker descriptor fields. Do not encode JSON Schema numeric/string format constraints as branded TypeScript types.

- [ ] **Step 4: Run the build and focused tests**

Run: `npm run build && npm test -- test/schema.test.ts test/authority.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the TypeScript contract deliverable**

```bash
git add src/types.ts test/types.fixture.ts tsconfig.json
git commit -m "fix: align public types with schemas"
```

### Task 4: Verify the integrated v0.1 correction

**Files:**
- Modify only files required to fix integration regressions found by the full suite.

**Interfaces:**
- Consumes: all deliverables from Tasks 1-3.
- Produces: a release-ready branch that passes the repository's declared verification command.

- [ ] **Step 1: Run formatting-insensitive diff checks**

Run: `git diff --check origin/main...HEAD`

Expected: no output and exit 0.

- [ ] **Step 2: Run the complete project gate under Node.js 22+**

Run: `node --version && npm run check`

Expected: Node reports v22 or newer; TypeScript build and all Vitest tests pass.

- [ ] **Step 3: Inspect the complete branch diff**

Run: `git diff --stat origin/main...HEAD && git diff origin/main...HEAD`

Expected: only the authority helper/tests/spec, event schema/tests/spec, TypeScript declarations/fixture/config, and this plan changed; no generated build output or docket metadata appears.

- [ ] **Step 4: Commit any integration-only corrections**

If Step 2 required code corrections, stage only those explicit paths and commit:

```bash
git commit -m "test: complete v0.1 contract verification" -- <explicit-paths>
```

If no corrections were needed, do not create an empty commit.
