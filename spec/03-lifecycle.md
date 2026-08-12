# 3. Lifecycle

```text
submitted -> accepted -> working -> completed | partial | failed | cancelled | budget_exhausted
    |           |           |
    +-> rejected|           +-> input_required -> working
    +-> cancelled           +-> cancelled
```

The valid transitions are exactly those implemented in `src/lifecycle.ts`: submitted→accepted/rejected/cancelled; accepted→working/failed/cancelled; working→input_required or any non-rejected terminal state; input_required→working/failed/cancelled/budget_exhausted. Terminal states never transition. `input_required` is suspended, not terminal. `rejected` means execution was never accepted; `failed` means accepted execution failed.

Cancellation is best effort until its `cancelled` event: a terminal result already recorded wins. Parent cancellation SHOULD propagate to active children unless explicitly detached by a future extension. Events for one delegation have monotonically increasing `sequence`; duplicates with the same sequence and content are harmless, while conflicting duplicates are protocol errors. Delivery may repeat and reconnecting observers resume after a sequence.

After a crash, a runtime MUST either recover its last externally recorded state or emit `failed`; it MUST NOT invent completion. Protocol state events are distinct from diagnostic/model telemetry. A terminal event's embedded result is required, and its `status` MUST equal the event `kind`; sequence-level validation remains a runtime responsibility.

OPEN QUESTION: Whether accepted work may be intentionally detached from parent cancellation needs a future policy model.
