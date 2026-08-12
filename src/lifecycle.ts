import type { LifecycleState } from "./types.js";

const transitions: Record<LifecycleState, ReadonlySet<LifecycleState>> = {
  submitted: new Set(["accepted", "rejected", "cancelled"]),
  accepted: new Set(["working", "cancelled", "failed"]),
  working: new Set(["input_required", "completed", "partial", "failed", "cancelled", "budget_exhausted"]),
  input_required: new Set(["working", "cancelled", "failed", "budget_exhausted"]),
  rejected: new Set(), completed: new Set(), partial: new Set(), failed: new Set(), cancelled: new Set(), budget_exhausted: new Set()
};
export function canTransition(from: LifecycleState, to: LifecycleState): boolean { return transitions[from].has(to); }
export function assertTransition(from: LifecycleState, to: LifecycleState): void { if (!canTransition(from,to)) throw new Error(`Invalid ADP lifecycle transition: ${from} -> ${to}`); }
export function isTerminal(state: LifecycleState): boolean { return transitions[state].size === 0; }
