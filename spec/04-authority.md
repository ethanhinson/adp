# 4. Authority

Authority explicitly covers capabilities, readable/writable roots, network mode, subprocesses, opaque credential handles, external side effects, approvals, and further delegation. Secret values MUST NOT appear in a request.

```text
effective child authority = parent effective authority
                          ∩ delegation grant
                          ∩ runtime policy
                          ∩ worker capability
```

Intersection is monotonic. A child receives equal or less authority and MUST NOT gain authority by requesting it. An expansion MUST be rejected, not silently broadened. Bounded network destinations are identifiers interpreted and enforced by the runtime; `any` is broader than `bounded`, and `none` is least. Filesystem roots cover descendants but implementations MUST canonicalize paths and prevent symlink/encoding escapes. A write grant does not implicitly grant read.

Approval requirements constrain otherwise granted actions; approval is not an authority source. A delegating worker requires `delegation.allowed`, remaining depth, and child budget. The TypeScript helper is deliberately conservative and is not a security boundary.

OPEN QUESTION: Portable comparison rules for wildcard destinations and command arguments are deferred; v0.1 uses exact strings.
