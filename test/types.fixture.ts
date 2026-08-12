import type { Artifact, DelegationRequest, DelegationResult, InputRequired, WorkerDescriptor } from "../src/types.js";

const digest = "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

const artifact: Artifact = {
  id: "artifact-1", kind: "structured_data", mediaType: "application/json", uri: "artifacts/output.json", digest, size: 1,
  producerDelegationId: "delegation-1", path: "output.json", schema: true, metadata: { source: "worker" }
};

const request: DelegationRequest = {
  specVersion: "0.1", id: "request-1", objective: { summary: "Compile public contracts", details: "Exercise every nested field." },
  parent: { delegationId: "parent-1", workerId: "worker-1", depth: 1 },
  context: [{ uri: "context.md", mediaType: "text/markdown", digest, description: "Context" }],
  workspace: { id: "workspace-1", uri: "https://example.test/workspace", baseRevision: "abc123", mode: "worktree", allowedRoots: [{ path: "/repo", access: "read_write" }], environment: [{ name: "TOKEN", binding: "credential:token" }], retention: { mode: "retain", until: "2026-08-12T00:00:00Z" } },
  authority: { capabilities: [], filesystem: { read: [], write: [] }, network: { mode: "none" }, subprocess: { allowed: false }, credentials: [], sideEffects: [], delegation: { allowed: false, maxDepth: 0 } },
  constraints: { deadline: "2026-08-12T00:00:00Z", timeoutMs: 1, maxTurns: 1, maxContextTokens: 1, priority: "high" },
  budget: { currency: "USD", cost: 1, inputTokens: 1, outputTokens: 1, totalTokens: 2, wallClockMs: 1, childDelegations: 1 },
  acceptanceCriteria: [{ id: "criterion-1", kind: "schema", description: "Matches schema", evaluator: "external", schema: true, property: "status", required: true }],
  expectedArtifacts: [{ id: "artifact-1", kind: "structured_data", mediaType: "application/json", path: "output.json", required: true, schema: true }],
  resultSchema: true,
  scheduling: { requiredCapabilities: ["typescript"], preferredCapabilities: ["tests"], trust: ["trusted"], locality: "any", workspaceModes: ["worktree"], contextRequirements: ["repo"], latencyClass: "interactive", costCeiling: 1, providerRestrictions: ["provider"], modelRestrictions: ["model"] },
  metadata: { source: "fixture" }
};

const result: DelegationResult = {
  specVersion: "0.1", delegationId: "delegation-1", status: "completed", summary: "Done", output: { ok: true }, artifacts: [artifact],
  acceptance: [{ criterionId: "criterion-1", status: "passed", evidenceArtifactIds: ["artifact-1"], message: "Verified", evaluator: "human" }],
  usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2, cost: 1, currency: "USD", wallClockMs: 1, childDelegations: 1 },
  diagnostics: [{ level: "info", code: "OK", message: "Done" }], metadata: { source: "fixture" }
};

const inputRequired: InputRequired = { delegationId: "delegation-1", requestId: "input-1", reason: "Need input", question: "Continue?", inputSchema: true, deadline: "2026-08-12T00:00:00Z", defaultBehavior: "cancel", partialArtifacts: [artifact], remainingBudget: { cost: 1 }, resumeToken: "1234567890123456" };

const worker: WorkerDescriptor = {
  specVersion: "0.1", id: "worker-1", name: "Worker", capabilities: ["typescript"],
  authorityMax: request.authority, locality: { kind: "local" }, supportedWorkspaceModes: ["worktree"],
  supportedFeatures: { suspension: true, nestedDelegation: true, artifacts: true, streaming: true },
  supportedBudgetDimensions: ["cost", "inputTokens", "outputTokens", "totalTokens", "wallClockMs", "childDelegations"],
  models: [{ id: "model-1", provider: "provider", metadata: { tier: "standard" } }], capacity: { available: true, queueDepth: 0, estimatedWaitMs: 0 }, metadata: { source: "fixture" }
};

// @ts-expect-error artifact kinds are schema-defined literals.
const invalidArtifact: Artifact = { ...artifact, kind: "unknown" };
// @ts-expect-error evaluators are schema-defined literals.
const invalidEvaluator: DelegationResult = { ...result, acceptance: [{ criterionId: "criterion-1", status: "passed", evaluator: "invalid" }] };
// @ts-expect-error workspace modes are schema-defined literals.
const invalidWorkspace: DelegationRequest = { ...request, workspace: { mode: "invalid" } };
// @ts-expect-error supported budget dimensions are schema-defined literals.
const invalidBudgetDimension: WorkerDescriptor = { ...worker, supportedBudgetDimensions: ["invalid"] };
// @ts-expect-error supported features are a closed schema-defined object.
const invalidFeature: WorkerDescriptor = { ...worker, supportedFeatures: { unknown: true } };

void [artifact, request, result, inputRequired, worker, invalidArtifact, invalidEvaluator, invalidWorkspace, invalidBudgetDimension, invalidFeature];
