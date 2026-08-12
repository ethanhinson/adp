import Ajv2020Module, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import addFormatsModule from "ajv-formats";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type DocumentKind = "authority"|"workspace"|"artifact"|"acceptance-criterion"|"input-required"|"delegation-request"|"delegation-result"|"delegation-event"|"worker-descriptor";
const kinds: DocumentKind[] = ["authority","workspace","artifact","acceptance-criterion","input-required","delegation-request","delegation-result","delegation-event","worker-descriptor"];
const Ajv2020 = Ajv2020Module.default;
const addFormats = addFormatsModule.default;
const ajv = new Ajv2020({ allErrors:true, strict:true, allowUnionTypes:true }); addFormats(ajv);
const validators = new Map<DocumentKind,ValidateFunction>();
for (const kind of kinds) {
  const path=fileURLToPath(new URL(`../schema/${kind}.schema.json`,import.meta.url));
  const schema=JSON.parse(readFileSync(path,"utf8")); ajv.addSchema(schema); validators.set(kind,ajv.getSchema(schema.$id)!);
}
export interface ValidationResult { valid: boolean; errors: ErrorObject[] }
export function validate(kind: DocumentKind, value: unknown): ValidationResult { const fn=validators.get(kind)!; const valid=fn(value); return {valid:!!valid,errors:fn.errors ? [...fn.errors] : []}; }
export function assertValid(kind: DocumentKind, value: unknown): void { const r=validate(kind,value); if(!r.valid) throw new Error(`${kind} validation failed: ${ajv.errorsText(r.errors)}`); }
