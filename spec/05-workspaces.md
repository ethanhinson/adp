# 5. Workspaces

A workspace is explicit context, never an assumed current directory. `id` identifies a runtime-managed instance; `uri` locates it; `baseRevision` pins an immutable starting point when available. Modes describe intended semantics: `shared`, `read_only`, isolated `worktree` or `sandbox`, and `remote`. They do not prescribe containers, VMs, overlays, or version-control commands.

Identity enables reproducibility, parallel work without accidental collision, authority rooted to a known location, immutable-base comparison, and artifact provenance. `allowedRoots` describes workspace intent and MUST remain within filesystem authority. Environment bindings are names/references, not secret values. Retention describes lifecycle intent; deletion mechanics are implementation-specific.

OPEN QUESTION: Cross-runtime workspace URI resolution and revision algorithms need transport profiles.
