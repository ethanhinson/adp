import type { Authority, CredentialGrant, NetworkAuthority } from "./types.js";

const intersectStrings = (...sets: string[][]): string[] => sets[0].filter(x => sets.slice(1).every(s => s.includes(x)));
const pathCovered = (path: string, grants: string[]) => grants.some(root => root === "/" || path === root || path.startsWith(root.endsWith("/") ? root : root + "/"));
const intersectPaths = (...sets: string[][]): string[] => sets[0].filter(path => sets.slice(1).every(s => pathCovered(path,s)));
function networkSubset(child: NetworkAuthority, parent: NetworkAuthority): boolean {
  if (child.mode === "none") return true;
  if (parent.mode === "none") return false;
  if (child.mode === "any") return parent.mode === "any";
  return parent.mode === "any" || child.destinations.every(d => parent.destinations.includes(d));
}
function intersectNetwork(values: NetworkAuthority[]): NetworkAuthority {
  if (values.some(v => v.mode === "none")) return { mode:"none" };
  const bounded = values.filter((v): v is Extract<NetworkAuthority,{mode:"bounded"}> => v.mode === "bounded");
  if (!bounded.length) return { mode:"any" };
  const destinations = intersectStrings(...bounded.map(v => v.destinations));
  return destinations.length ? { mode:"bounded", destinations } : { mode:"none" };
}
function intersectCredentials(values: CredentialGrant[][]): CredentialGrant[] {
  return values[0].flatMap(first => {
    const matches = values.slice(1).map(v => v.find(x => x.handle === first.handle));
    if (matches.some(x => !x)) return [];
    const scoped = [first,...matches as CredentialGrant[]];
    if (scoped.some(x => x.scopes === undefined)) return [{ handle:first.handle, scopes: scoped.find(x=>x.scopes)?.scopes }];
    return [{ handle:first.handle, scopes:intersectStrings(...scoped.map(x=>x.scopes!)) }];
  });
}
export function intersectAuthority(parent: Authority, grant: Authority, runtimePolicy: Authority, workerMaximum: Authority): Authority {
  const all=[parent,grant,runtimePolicy,workerMaximum];
  return { capabilities:intersectStrings(...all.map(x=>x.capabilities)), filesystem:{read:intersectPaths(...all.map(x=>x.filesystem.read)),write:intersectPaths(...all.map(x=>x.filesystem.write))}, network:intersectNetwork(all.map(x=>x.network)), subprocess:{allowed:all.every(x=>x.subprocess.allowed),commands:intersectStrings(...all.map(x=>x.subprocess.commands ?? []))}, credentials:intersectCredentials(all.map(x=>x.credentials)), sideEffects:intersectStrings(...all.map(x=>x.sideEffects)), approvals: grant.approvals, delegation:{allowed:all.every(x=>x.delegation.allowed),maxDepth:Math.min(...all.map(x=>x.delegation.maxDepth))} };
}
export function isAuthoritySubset(child: Authority, parent: Authority): boolean {
  return child.capabilities.every(x=>parent.capabilities.includes(x)) && child.filesystem.read.every(x=>pathCovered(x,parent.filesystem.read)) && child.filesystem.write.every(x=>pathCovered(x,parent.filesystem.write)) && networkSubset(child.network,parent.network) && (!child.subprocess.allowed || parent.subprocess.allowed) && (child.subprocess.commands ?? []).every(x=>(parent.subprocess.commands ?? []).includes(x)) && child.credentials.every(c=>parent.credentials.some(p=>p.handle===c.handle && (!c.scopes || !p.scopes || c.scopes.every(s=>p.scopes!.includes(s))))) && child.sideEffects.every(x=>parent.sideEffects.includes(x)) && (!child.delegation.allowed || (parent.delegation.allowed && child.delegation.maxDepth<=parent.delegation.maxDepth));
}
