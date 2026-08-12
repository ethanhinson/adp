import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const readPrompt = (name: string) => readFileSync(new URL(`../prompts/${name}.system.md`, import.meta.url), "utf8");

describe("reference prompt contracts", () => {
  it.each(["delegator", "worker", "verifier"])("keeps enforcement outside the prompt in %s", name => {
    expect(readPrompt(name)).toMatch(/Runtime (policy and )?enforcement .*supersede/i);
  });

  it("requires the delegator to verify evidence before accepting completion", () => {
    const prompt = readPrompt("delegator");
    expect(prompt).toContain("## Decide whether to delegate");
    expect(prompt).toContain("## Evaluate a terminal result");
    expect(prompt).toMatch(/fresh evidence/i);
  });

  it("gives the worker preflight, stop, verification, and return contracts", () => {
    const prompt = readPrompt("worker");
    for (const heading of ["## Preflight before work", "## Execute", "## Verify before selecting a result status", "## Return contract"])
      expect(prompt).toContain(heading);
    expect(prompt).toMatch(/Do not guess a material requirement/);
  });

  it("keeps the verifier independent and structured", () => {
    const prompt = readPrompt("verifier");
    expect(prompt).toContain("read-only evaluator");
    expect(prompt).toContain("## Evaluation procedure");
    expect(prompt).toContain('"claimedStatusConsistent"');
    expect(prompt).toMatch(/never self-approve/i);
  });
});
