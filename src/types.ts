export type LifecycleState =
  | "submitted"
  | "accepted"
  | "rejected"
  | "working"
  | "input_required"
  | "completed"
  | "partial"
  | "failed"
  | "cancelled"
  | "budget_exhausted";
export type TerminalStatus =
  | "completed"
  | "partial"
  | "failed"
  | "cancelled"
  | "budget_exhausted"
  | "rejected";
export type JsonSchema = Record<string, unknown> | boolean;
export type ArtifactKind =
  | "file"
  | "patch"
  | "test_report"
  | "structured_data"
  | "report"
  | "log"
  | "blob";
export type Evaluator = "worker" | "caller" | "external" | "human";
export type WorkspaceMode =
  | "shared"
  | "read_only"
  | "worktree"
  | "sandbox"
  | "remote";
export type BudgetDimension =
  | "cost"
  | "inputTokens"
  | "outputTokens"
  | "totalTokens"
  | "wallClockMs"
  | "childDelegations";

export type NetworkAuthority =
  | { mode: "none" }
  | { mode: "bounded"; destinations: string[] }
  | { mode: "any" };
export interface CredentialGrant {
  handle: string;
  scopes?: string[];
}
export interface Authority {
  capabilities: string[];
  filesystem: { read: string[]; write: string[] };
  network: NetworkAuthority;
  subprocess: { allowed: boolean; commands?: string[] };
  credentials: CredentialGrant[];
  sideEffects: string[];
  approvals?: { action: string; required: boolean }[];
  delegation: { allowed: boolean; maxDepth: number };
}

export interface ContextEntry {
  uri: string;
  mediaType?: string;
  digest?: string;
  description?: string;
}
export interface WorkspaceEnvironment {
  name: string;
  binding: string;
}
export interface WorkspaceRetention {
  mode: "discard" | "retain" | "caller_managed";
  until?: string;
}
export interface WorkspaceRef {
  id?: string;
  uri?: string;
  baseRevision?: string;
  mode: WorkspaceMode;
  allowedRoots?: { path: string; access: "read" | "write" | "read_write" }[];
  environment?: WorkspaceEnvironment[];
  retention?: WorkspaceRetention;
}
export interface Constraints {
  deadline?: string;
  timeoutMs?: number;
  maxTurns?: number;
  maxContextTokens?: number;
  priority?: "low" | "normal" | "high";
}
export interface Budget {
  currency?: string;
  cost?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  wallClockMs?: number;
  childDelegations?: number;
}
export interface ArtifactSpec {
  id: string;
  kind: ArtifactKind;
  mediaType?: string;
  path?: string;
  required?: boolean;
  schema?: JsonSchema;
}
export interface Scheduling {
  requiredCapabilities?: string[];
  preferredCapabilities?: string[];
  trust?: string[];
  locality?: "local" | "remote" | "hybrid" | "any";
  workspaceModes?: WorkspaceMode[];
  contextRequirements?: string[];
  latencyClass?: "interactive" | "batch" | "flexible";
  costCeiling?: number;
  providerRestrictions?: string[];
  modelRestrictions?: string[];
}

export interface AcceptanceCriterion {
  id: string;
  kind:
    | "command"
    | "artifact"
    | "schema"
    | "assertion"
    | "external_evaluator"
    | "human_approval";
  description: string;
  evaluator?: Evaluator;
  command?: string;
  artifactSpecId?: string;
  schema?: JsonSchema;
  property?: string;
  required?: boolean;
}
export interface Artifact {
  id: string;
  kind: ArtifactKind;
  mediaType: string;
  uri: string;
  digest: string;
  size: number;
  producerDelegationId: string;
  path?: string;
  schema?: JsonSchema;
  metadata?: Record<string, string>;
}
export interface DelegationRequest {
  specVersion: "0.1";
  id: string;
  parent?: { delegationId: string; workerId?: string; depth: number };
  objective: { summary: string; details?: string };
  context?: ContextEntry[];
  workspace?: WorkspaceRef;
  authority: Authority;
  constraints?: Constraints;
  budget?: Budget;
  acceptanceCriteria?: AcceptanceCriterion[];
  expectedArtifacts?: ArtifactSpec[];
  resultSchema?: JsonSchema;
  scheduling?: Scheduling;
  metadata?: Record<string, string>;
}

export interface AcceptanceResult {
  criterionId: string;
  status: "passed" | "failed" | "not_run" | "needs_review";
  evidenceArtifactIds?: string[];
  message?: string;
  evaluator?: Evaluator;
}
export interface Usage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  cost?: number;
  currency?: string;
  wallClockMs?: number;
  childDelegations?: number;
}
export interface Diagnostic {
  level: "info" | "warning" | "error";
  code?: string;
  message: string;
}
export interface DelegationResult {
  specVersion: "0.1";
  delegationId: string;
  status: TerminalStatus;
  summary?: string;
  output?: unknown;
  artifacts?: Artifact[];
  acceptance?: AcceptanceResult[];
  usage?: Usage;
  diagnostics?: Diagnostic[];
  metadata?: Record<string, string>;
}
export interface InputRequired {
  delegationId: string;
  requestId: string;
  reason: string;
  question: string;
  inputSchema?: JsonSchema;
  deadline?: string;
  defaultBehavior?: string;
  partialArtifacts?: Artifact[];
  remainingBudget?: Record<string, number>;
  resumeToken?: string;
}

export interface WorkerFeatures {
  suspension?: boolean;
  nestedDelegation?: boolean;
  artifacts?: boolean;
  streaming?: boolean;
}
export interface WorkerModel {
  id: string;
  provider?: string;
  metadata?: Record<string, string>;
}
export interface WorkerCapacity {
  available?: boolean;
  queueDepth?: number;
  estimatedWaitMs?: number;
}
export interface WorkerDescriptor {
  specVersion: "0.1";
  id: string;
  name?: string;
  capabilities: string[];
  authorityMax?: Authority;
  locality?: { kind: "local" | "remote" | "hybrid" };
  supportedWorkspaceModes?: WorkspaceMode[];
  supportedFeatures?: WorkerFeatures;
  supportedBudgetDimensions?: BudgetDimension[];
  models?: WorkerModel[];
  capacity?: WorkerCapacity;
  metadata?: Record<string, string>;
}
