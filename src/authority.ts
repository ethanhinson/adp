import type { Authority, CredentialGrant, NetworkAuthority } from "./types.js";

const intersectStrings = (...sets: string[][]): string[] =>
  sets[0].filter((x) => sets.slice(1).every((s) => s.includes(x)));

/** Returns whether a granted root includes the path itself or one of its ancestors. */
const pathCovered = (path: string, grants: string[]) =>
  grants.some(
    (root) =>
      root === "/" ||
      path === root ||
      path.startsWith(root.endsWith("/") ? root : root + "/"),
  );
const intersectPaths = (...sets: string[][]): string[] => {
  // A valid intersection root may originate in any input. Looking only at the
  // first input would incorrectly discard a narrower root supplied later.
  const candidates = [...new Set(sets.flat())].filter((path) =>
    sets.every((grants) => pathCovered(path, grants)),
  );

  // Prefer the broadest equivalent root so the result contains no redundant
  // descendants such as both `/repo` and `/repo/src`.
  return candidates.filter(
    (path) =>
      !candidates.some((root) => root !== path && pathCovered(path, [root])),
  );
};
function networkSubset(
  child: NetworkAuthority,
  parent: NetworkAuthority,
): boolean {
  if (child.mode === "none") return true;
  if (parent.mode === "none") return false;
  if (child.mode === "any") return parent.mode === "any";
  return (
    parent.mode === "any" ||
    child.destinations.every((d) => parent.destinations.includes(d))
  );
}
function intersectNetwork(values: NetworkAuthority[]): NetworkAuthority {
  if (values.some((v) => v.mode === "none")) return { mode: "none" };
  const bounded = values.filter(
    (v): v is Extract<NetworkAuthority, { mode: "bounded" }> =>
      v.mode === "bounded",
  );
  if (!bounded.length) return { mode: "any" };
  const destinations = intersectStrings(...bounded.map((v) => v.destinations));
  return destinations.length
    ? { mode: "bounded", destinations }
    : { mode: "none" };
}
function intersectCredentials(values: CredentialGrant[][]): CredentialGrant[] {
  return [
    ...new Set(values.flatMap((grants) => grants.map((grant) => grant.handle))),
  ].flatMap((handle) => {
    const grants = values.map((value) =>
      value.find((grant) => grant.handle === handle),
    );
    if (grants.some((grant) => !grant)) return [];
    // Omitted scopes mean unrestricted access to this handle. Only explicit
    // scope lists constrain the intersection.
    const explicitScopes = (grants as CredentialGrant[]).flatMap((grant) =>
      grant.scopes === undefined ? [] : [grant.scopes],
    );
    if (!explicitScopes.length) return [{ handle }];
    const scopes = intersectStrings(...explicitScopes);
    return scopes.length ? [{ handle, scopes }] : [];
  });
}

function credentialSubset(
  child: CredentialGrant,
  parent: CredentialGrant,
): boolean {
  if (child.handle !== parent.handle) return false;

  // An unscoped child is unrestricted, so only an unscoped parent can contain
  // it. An unscoped parent, however, contains every explicitly scoped child.
  if (child.scopes === undefined) return parent.scopes === undefined;
  if (parent.scopes === undefined) return true;
  const parentScopes = parent.scopes;
  return child.scopes.every((scope) => parentScopes.includes(scope));
}

function preservesRequiredApprovals(
  child: Authority,
  parent: Authority,
): boolean {
  const childApprovals = child.approvals ?? [];
  return (parent.approvals ?? [])
    .filter((approval) => approval.required)
    .every((required) =>
      childApprovals.some(
        (approval) => approval.required && approval.action === required.action,
      ),
    );
}

/**
 * Computes the authority common to the parent, explicit grant, runtime policy,
 * and worker maximum. This helper models ADP attenuation; runtime enforcement
 * and path canonicalization remain security-boundary responsibilities.
 */
export function intersectAuthority(
  parent: Authority,
  grant: Authority,
  runtimePolicy: Authority,
  workerMaximum: Authority,
): Authority {
  const all = [parent, grant, runtimePolicy, workerMaximum];
  return {
    capabilities: intersectStrings(...all.map((x) => x.capabilities)),
    filesystem: {
      read: intersectPaths(...all.map((x) => x.filesystem.read)),
      write: intersectPaths(...all.map((x) => x.filesystem.write)),
    },
    network: intersectNetwork(all.map((x) => x.network)),
    subprocess: {
      allowed: all.every((x) => x.subprocess.allowed),
      commands: intersectStrings(
        ...all.map((x) => x.subprocess.commands ?? []),
      ),
    },
    credentials: intersectCredentials(all.map((x) => x.credentials)),
    sideEffects: intersectStrings(...all.map((x) => x.sideEffects)),
    // Approval requirements are constraints. Any required approval must survive
    // intersection; an omitted or false entry cannot cancel it.
    approvals: [
      ...new Set(
        all.flatMap((x) =>
          (x.approvals ?? [])
            .filter((approval) => approval.required)
            .map((approval) => approval.action),
        ),
      ),
    ].map((action) => ({ action, required: true })),
    delegation: {
      allowed: all.every((x) => x.delegation.allowed),
      maxDepth: Math.min(...all.map((x) => x.delegation.maxDepth)),
    },
  };
}

/** Returns true when every child permission and constraint fits the parent. */
export function isAuthoritySubset(
  child: Authority,
  parent: Authority,
): boolean {
  return (
    child.capabilities.every((x) => parent.capabilities.includes(x)) &&
    child.filesystem.read.every((x) =>
      pathCovered(x, parent.filesystem.read),
    ) &&
    child.filesystem.write.every((x) =>
      pathCovered(x, parent.filesystem.write),
    ) &&
    networkSubset(child.network, parent.network) &&
    (!child.subprocess.allowed || parent.subprocess.allowed) &&
    (child.subprocess.commands ?? []).every((x) =>
      (parent.subprocess.commands ?? []).includes(x),
    ) &&
    child.credentials.every((childCredential) =>
      parent.credentials.some((parentCredential) =>
        credentialSubset(childCredential, parentCredential),
      ),
    ) &&
    child.sideEffects.every((x) => parent.sideEffects.includes(x)) &&
    preservesRequiredApprovals(child, parent) &&
    (!child.delegation.allowed ||
      (parent.delegation.allowed &&
        child.delegation.maxDepth <= parent.delegation.maxDepth))
  );
}
