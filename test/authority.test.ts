import { describe, expect, it } from "vitest";
import { intersectAuthority, isAuthoritySubset } from "../src/authority.js";
import type { Authority } from "../src/types.js";

const auth = (p: Partial<Authority> = {}): Authority => ({
  capabilities: ["shell", "test"], filesystem: { read: ["/repo"], write: ["/repo"] }, network: { mode: "any" },
  subprocess: { allowed: true, commands: ["npm"] }, credentials: [{ handle: "secret:a", scopes: ["read"] }],
  sideEffects: ["issue.comment"], delegation: { allowed: true, maxDepth: 3 }, ...p,
});

describe("authority", () => {
  it("attenuates read/write and runtime policy", () => {
    const child = intersectAuthority(auth(), auth({ filesystem: { read: ["/repo"], write: [] } }), auth({ capabilities: ["test"] }), auth());
    expect(child.filesystem.write).toEqual([]); expect(child.filesystem.read).toEqual(["/repo"]); expect(child.capabilities).toEqual(["test"]);
  });
  it("intersects filesystem roots independently of input order", () => {
    expect(intersectAuthority(auth({ filesystem: { read: ["/repo"], write: ["/repo"] } }), auth({ filesystem: { read: ["/repo/src"], write: ["/repo/src"] } }), auth(), auth()).filesystem).toEqual({ read: ["/repo/src"], write: ["/repo/src"] });
    expect(intersectAuthority(auth({ filesystem: { read: ["/repo/src"], write: ["/repo/src"] } }), auth({ filesystem: { read: ["/repo"], write: ["/repo"] } }), auth(), auth()).filesystem).toEqual({ read: ["/repo/src"], write: ["/repo/src"] });
  });
  it("removes redundant descendant filesystem roots", () => {
    expect(intersectAuthority(auth({ filesystem: { read: ["/repo", "/repo/src"], write: ["/repo", "/repo/src"] } }), auth(), auth(), auth()).filesystem).toEqual({ read: ["/repo"], write: ["/repo"] });
  });
  it("intersects credential scopes and drops empty scope intersections", () => {
    expect(intersectAuthority(auth({ credentials: [{ handle: "secret:a" }] }), auth({ credentials: [{ handle: "secret:a", scopes: ["read", "write"] }] }), auth({ credentials: [{ handle: "secret:a", scopes: ["read"] }] }), auth({ credentials: [{ handle: "secret:a" }] })).credentials).toEqual([{ handle: "secret:a", scopes: ["read"] }]);
    expect(intersectAuthority(auth({ credentials: [{ handle: "secret:a", scopes: ["read"] }] }), auth({ credentials: [{ handle: "secret:a", scopes: ["write"] }] }), auth({ credentials: [{ handle: "secret:a" }] }), auth({ credentials: [{ handle: "secret:a" }] })).credentials).toEqual([]);
  });
  it("preserves unrestricted credentials when no source scopes them", () => {
    expect(intersectAuthority(auth({ credentials: [{ handle: "secret:a" }] }), auth({ credentials: [{ handle: "secret:a" }] }), auth({ credentials: [{ handle: "secret:a" }] }), auth({ credentials: [{ handle: "secret:a" }] })).credentials).toEqual([{ handle: "secret:a" }]);
  });
  it("accumulates required approvals and forbids weakening them", () => {
    expect(intersectAuthority(auth({ approvals: [{ action: "deploy", required: true }] }), auth({ approvals: [] }), auth(), auth()).approvals).toEqual([{ action: "deploy", required: true }]);
    expect(isAuthoritySubset(auth({ approvals: [] }), auth({ approvals: [{ action: "deploy", required: true }] }))).toBe(false);
    expect(isAuthoritySubset(auth({ approvals: [{ action: "deploy", required: true }, { action: "publish", required: true }] }), auth({ approvals: [{ action: "deploy", required: true }] }))).toBe(true);
  });
  it("cannot create network or credentials", () => {
    expect(isAuthoritySubset(auth({ network: { mode: "bounded", destinations: ["api.example"] } }), auth({ network: { mode: "none" } }))).toBe(false);
    expect(isAuthoritySubset(auth({ credentials: [{ handle: "secret:b" }] }), auth())).toBe(false);
  });
  it("does not let an unrestricted credential exceed restricted parent scopes", () => {
    expect(isAuthoritySubset(auth({ credentials: [{ handle: "secret:a" }] }), auth({ credentials: [{ handle: "secret:a", scopes: ["read"] }] }))).toBe(false);
  });
  it("can prohibit further delegation", () => {
    const child = intersectAuthority(auth(), auth({ delegation: { allowed: false, maxDepth: 0 } }), auth(), auth());
    expect(child.delegation).toEqual({ allowed: false, maxDepth: 0 }); expect(isAuthoritySubset(child, auth())).toBe(true);
  });
});
