<!-- docket:backlink:start (generated — do not hand-edit) -->
> ↩ **[Change 0001 — Correct v0.1 authority and event contract consistency](https://github.com/ethanhinson/adp/blob/docket/docs/changes/active/0001-correct-v0-1-contract-consistency.md)**
<!-- docket:backlink:end -->

# Correct v0.1 authority and event contract consistency

## Context

ADP v0.1 defines its specification and JSON Schemas as authoritative and supplies TypeScript as reference tooling. A phase-one review identified four concrete contract defects plus public type drift:

1. effective authority copies approval constraints only from the child grant, so parent or runtime requirements can disappear;
2. credential intersection can return scopes broader than the scopes common to every authority source;
3. terminal event schemas require a result but do not require its status to match the event kind;
4. filesystem-root intersection depends on argument order and can erase a valid narrower root; and
5. exported TypeScript interfaces are materially looser or less complete than their canonical schemas.

The implementation must repair these defects without promoting the helper into a security boundary or expanding the protocol beyond v0.1.

## Design

### Authority algebra

Authority intersection remains the intersection of parent effective authority, delegation grant, runtime policy, and worker maximum.

Filesystem roots are treated as descendant-covering sets. The intersection algorithm will consider roots supplied by every input, retain roots covered by every authority source, deduplicate them, and remove redundant descendants already covered by a retained broader root. Consequently, intersecting `/repo` with `/repo/src` yields `/repo/src` regardless of input order. The helper remains conservative and continues to rely on runtimes for canonicalization, symlink protection, and enforcement.

For a credential handle, omitted `scopes` means unrestricted scopes for that handle, not absence of the handle. Intersection will therefore:

- require the handle to exist in every authority source;
- intersect every explicitly supplied scope list;
- preserve omitted scopes only when no source restricts them; and
- remove the credential when explicit restrictions have no scope in common.

Approval entries are constraints rather than authority sources. A required approval from any input must survive effective-authority computation. The effective representation will retain the union of actions marked `required: true`; an absent or false entry cannot cancel another source's requirement. Subset checking will reject a child that omits or weakens any approval required by its parent, while allowing a child to add stricter approval requirements.

The normative authority specification will state these scope and approval rules explicitly.

### Terminal events

The event schema will retain the existing terminal-result requirement and add a conditional for each terminal event kind. Each conditional requires `result.status` to equal that kind: `completed`, `partial`, `failed`, `cancelled`, `budget_exhausted`, or `rejected`.

This keeps lifecycle state unambiguous at schema-validation time. It does not introduce cross-event sequence validation, which remains a runtime responsibility.

### TypeScript contract

The exported TypeScript declarations will model the existing canonical schema rather than using broad placeholders where practical. This includes:

- enumerated artifact kinds and evaluator values;
- concrete context, constraint, budget, artifact-spec, scheduling, usage, diagnostic, and worker-descriptor structures;
- schema-valued fields represented as JSON Schema objects or booleans; and
- all currently published worker descriptor fields.

This is a hand-maintained alignment pass. Schema-to-TypeScript generation is intentionally deferred because it would add build machinery unrelated to correcting the reviewed contract.

## Compatibility and error handling

The changes preserve exported function names and the v0.1 wire format. Inputs that relied on the defective behavior may produce narrower effective authority or fail validation, which is the intended security-compatible correction.

The event schema will return ordinary AJV validation errors for mismatched terminal status. The authority helper will continue returning an effective authority value; it will not throw for empty intersections.

## Testing

Implementation follows test-driven development, with each regression observed failing before its production change:

- filesystem intersection returns the narrower root and is invariant under authority ordering;
- credential scope intersection considers all explicit restrictions and drops an empty intersection;
- parent/runtime approval requirements survive intersection and cannot be weakened by subset checks;
- every terminal event kind accepts its matching result and rejects a mismatched result;
- representative TypeScript fixtures exercise newly precise public types at compile time; and
- existing examples, schema fixtures, prompt tests, lifecycle tests, the full test suite, and the TypeScript build remain green under Node.js 22+.

## Non-goals

This change will not add duplicate-ID checks across arrays, artifact-reference resolution, lifecycle sequence persistence, schema generation, path canonicalization, sandbox enforcement, or new protocol fields. Those require separate design decisions and are not necessary to close the reviewed phase-one defects.
