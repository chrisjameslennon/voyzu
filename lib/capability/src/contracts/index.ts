import "server-only";
import { type Static, type TSchema } from "typebox";
import Schema from "typebox/schema";
import { isDeepStrictEqual } from "node:util";
import type { CapabilityContract, CapabilityProvider, SemanticDataContract, SemanticDataProvider, PackageContracts } from "@voyzu/types/contracts";
import { withTransaction } from "../db/db";
import { InputValidationError } from "../errors";

/** Augmented by composition; consumers never import provider packages. */
export interface CapabilityContracts {}
export interface SemanticDataContracts {}
type Name = keyof SemanticDataContracts & string;
type Definition<K extends Name> = SemanticDataContracts[K];
type Root<K extends Name> = Definition<K> extends { extends: infer R extends Name } ? R : K;
type Identifier<K extends Name> = Definition<Root<K>> extends { identifierDataDefinition: infer S extends TSchema } ? Static<S> : never;
type Own<K extends Name> = (Definition<Root<K>> extends { identifier: infer I extends string } ? { [P in I]: Identifier<K> } : {}) &
  (Definition<K> extends { dataDefinition: infer S extends TSchema } ? Static<S> : {});
type Parts<K extends Name> = Definition<K> extends { extensions: readonly (infer E extends Name)[] } ? Root<K> | E | (Definition<K> extends { dataDefinition: TSchema } ? K : never) : K;
type Intersection<U> = (U extends unknown ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
export type SemanticDataValue<K extends Name> = Intersection<{ [P in Parts<K>]: Own<P> }[Parts<K>]>;
type Wrapped<K extends Name> = { [P in Parts<K>]: Own<P> };
type Result<K extends Name, W extends boolean> = W extends true ? Wrapped<K> : SemanticDataValue<K>;
type QueryName<K extends Name> = Definition<K> extends { queries: infer Q } ? keyof Q & string : never;
type QueryInput<K extends Name, Q extends QueryName<K>> = Definition<K> extends { queries: Record<Q, { inputDataDefinition: infer S extends TSchema }> } ? Static<S> : never;
type Methods<C> = C extends { functions: infer F } ? {
  [M in keyof F]: (...args: F[M] extends { input: infer I extends TSchema } ? [input: Static<I>] : []) =>
    Promise<F[M] extends { output: infer O extends TSchema } ? Static<O> : void>;
} : never;
export type ContractPackage = { name: string; contracts?: PackageContracts };
export class ContractError extends Error {}
const unsafe = new Set(["__proto__", "prototype", "constructor"]);

function validate(schema: TSchema, value: unknown, label: string, input = false) {
  const validator = Schema.Compile(schema);
  if (validator.Check(value)) return;
  const message = `${label}: ${validator.Errors(value)[1].map(e => `${e.instancePath} ${e.message}`).join("; ")}`;
  if (input) throw new InputValidationError(message);
  throw new ContractError(message);
}

/** Compose-time only: does not invoke providers or access a database. */
export function resolveContractConfiguration(packages: readonly ContractPackage[]) {
  const capabilityDefinitions = new Map<string, CapabilityContract>();
  const dataDefinitions = new Map<string, SemanticDataContract>();
  const capabilityProviders = new Map<string, CapabilityProvider>();
  const dataProviders = new Map<string, SemanticDataProvider>();
  function add<T>(map: Map<string, T>, name: string, value: T) {
    if (map.has(name)) throw new ContractError(`Duplicate contract registration: ${name}`);
    if (!name || name.split(".").some(part => !part || unsafe.has(part))) throw new ContractError(`Invalid contract name: ${name}`);
    map.set(name, value);
  }
  for (const { contracts: c } of packages) {
    for (const [n,d] of Object.entries(c?.semanticCapabilityDefinition?.defines ?? {})) add(capabilityDefinitions,n,d);
    for (const [n,d] of Object.entries(c?.semanticDataDefinition?.defines ?? {})) add(dataDefinitions,n,d);
    for (const [n,p] of Object.entries(c?.semanticCapabilityDefinition?.implements ?? {})) add(capabilityProviders,n,p);
    for (const [n,p] of Object.entries(c?.semanticDataDefinition?.implements ?? {})) add(dataProviders,n,p);
  }
  for (const [n,d] of capabilityDefinitions) {
    if (!Object.keys(d.functions).length) throw new ContractError(`${n} requires functions`);
    for (const [m,f] of Object.entries(d.functions)) {
      if (unsafe.has(m)) throw new ContractError(`Invalid function ${n}.${m}`);
      if (f.input) Schema.Compile(f.input);
      if (f.output) Schema.Compile(f.output);
    }
  }
  for (const [n,p] of capabilityProviders) {
    const d = capabilityDefinitions.get(n);
    if (!d) throw new ContractError(`Undefined capability ${n}`);
    for (const m of Object.keys(d.functions)) if (typeof p[m] !== "function") throw new ContractError(`Missing provider method ${n}.${m}`);
    for (const m of Object.keys(p)) if (!(m in d.functions)) throw new ContractError(`Undeclared provider method ${n}.${m}`);
  }
  for (const [n,d] of dataDefinitions) {
    if (!d.dataDefinition && !d.extensions?.length) throw new ContractError(`${n} must define data or extensions`);
    const root = d.extends ? dataDefinitions.get(d.extends) : d;
    if (!root || (d.extends && root.extends)) throw new ContractError(`Invalid root or unsupported nesting for ${n}`);
    if (d.extends && (d.identifier || d.identifierDataDefinition)) throw new ContractError(`${n} must inherit its identifier`);
    if (!root.identifier || unsafe.has(root.identifier) || !root.identifierDataDefinition) throw new ContractError(`${n} requires a root identifier`);
    Schema.Compile(root.identifierDataDefinition);
    if (d.dataDefinition) {
      if (d.dataDefinition.type !== "object") throw new ContractError(`${n} dataDefinition must be an object`);
      Schema.Compile(d.dataDefinition);
      const fields = Object.keys(d.dataDefinition.properties ?? {});
      if (fields.some(f => unsafe.has(f) || f === root.identifier)) throw new ContractError(`${n} has an invalid data field or redeclares its identifier`);
    }
    for (const [q,s] of Object.entries(d.queries ?? {})) {
      if (unsafe.has(q)) throw new ContractError(`Invalid query ${n}.${q}`);
      Schema.Compile(s.inputDataDefinition);
    }
    if (d.extensions) {
      if (!d.extends) throw new ContractError(`${n} composition requires extends`);
      const fields = new Set<string>();
      const parts = [d.extends, ...d.extensions, ...(d.dataDefinition ? [n] : [])];
      if (new Set(parts).size !== parts.length) throw new ContractError(`Duplicate composition contribution ${n}`);
      for (const part of parts) {
        const contributor = dataDefinitions.get(part);
        if (!contributor || (part !== d.extends && part !== n && (contributor.extends !== d.extends || contributor.extensions))) throw new ContractError(`Invalid contributor ${part} in ${n}`);
        for (const field of Object.keys(contributor.dataDefinition?.properties ?? {})) {
          if (fields.has(field)) throw new ContractError(`Duplicate composition field ${n}.${field}`);
          fields.add(field);
        }
      }
    }
  }
  for (const [n,p] of dataProviders) {
    const d = dataDefinitions.get(n);
    if (!d) throw new ContractError(`Undefined semantic data ${n}`);
    if (typeof p.get !== "function") throw new ContractError(`${n} requires get`);
    for (const q of Object.keys(d.queries ?? {})) if (typeof p.queries?.[q] !== "function") throw new ContractError(`${n} requires query ${q}`);
    for (const q of Object.keys(p.queries ?? {})) if (!d.queries?.[q]) throw new ContractError(`Undeclared query ${n}.${q}`);
  }
  return { capabilityDefinitions, dataDefinitions, capabilityProviders, dataProviders };
}

function createContractRuntime(configuration: ReturnType<typeof resolveContractConfiguration>) {
  const { capabilityDefinitions, dataDefinitions, capabilityProviders, dataProviders } = configuration;
  function optional<K extends keyof CapabilityContracts & string>(name: K): Methods<CapabilityContracts[K]> | undefined {
    const d = capabilityDefinitions.get(name);
    if (!d) throw new ContractError(`Undefined capability ${name}`);
    const provider = capabilityProviders.get(name);
    if (!provider) return undefined;
    const methods = Object.create(null);
    for (const [m,f] of Object.entries(d.functions)) {
      methods[m] = async (...args: unknown[]) => {
        if (f.input) validate(f.input,args[0],`${name}.${m} input`,true);
        else if (args.length) throw new InputValidationError(`${name}.${m} takes no arguments`);
        const invoke = async () => {
          const result = await provider[m](...args);
          if (f.output) validate(f.output,result,`${name}.${m} output`);
          else if (result !== undefined) throw new ContractError(`${name}.${m} must not return a value`);
          return result;
        };
        return f.transactional ? withTransaction(invoke) : invoke();
      };
    }
    return methods;
  }
  const capabilities = {
    optional,
    use<K extends keyof CapabilityContracts & string>(name: K) {
      const p = optional(name);
      if (!p) throw new ContractError(`No implementation for capability ${name}`);
      return p;
    },
    transaction: withTransaction,
  };
  function definition(name: string) {
    const d = dataDefinitions.get(name);
    if (!d) throw new ContractError(`Undefined semantic data ${name}`);
    return d;
  }
  function root(name: string) {
    const d = definition(name);
    return d.extends ? definition(d.extends) : d;
  }
  function parts(name: string): string[] {
    const d = definition(name);
    return d.extensions ? [d.extends!, ...d.extensions, ...(d.dataDefinition ? [name] : [])] : [name];
  }
  function available(name: string) {
    definition(name);
    return [name, ...parts(name)].every(n => dataProviders.has(n));
  }
  function requireProvider(name: string) {
    if (!available(name)) throw new ContractError(`No implementation for semantic data ${name} or a required contribution`);
  }
  function recordSchema(name: string) {
    const r = root(name);
    const properties = Object.assign({}, ...parts(name).map(n => definition(n).dataDefinition?.properties ?? {}));
    const required = [...new Set([r.identifier!, ...parts(name).flatMap(n => definition(n).dataDefinition?.required ?? [])])];
    return { type: "object", properties: { ...properties, [r.identifier!]: r.identifierDataDefinition! }, required, additionalProperties: false } as TSchema;
  }
  function checkRecord(name: string, value: unknown, identifier?: unknown) {
    validate(recordSchema(name),value,`${name} output`);
    const record = value as Record<string, unknown>;
    for (const part of parts(name)) {
      const schema = definition(part).dataDefinition;
      if (!schema) continue;
      const data = Object.fromEntries(Object.keys(schema.properties).filter(key => Object.hasOwn(record,key)).map(key => [key,record[key]]));
      validate(schema,data,`${part} data`);
    }
    if (identifier !== undefined && !isDeepStrictEqual((value as Record<string,unknown>)[root(name).identifier!],identifier)) throw new ContractError(`${name} returned a different identifier`);
  }
  function present(name: string, record: any, wrapped: boolean) {
    if (record === null || !wrapped) return record;
    const identifier = root(name).identifier!;
    return Object.fromEntries(parts(name).map(n => [n, Object.fromEntries([identifier, ...Object.keys(definition(n).dataDefinition?.properties ?? {})].filter(f => Object.hasOwn(record,f)).map(f => [f,record[f]]))]));
  }
  async function get(name: string, id: unknown, optional: boolean, wrapped: boolean) {
    const r = root(name);
    validate(r.identifierDataDefinition!,id,`${name} identifier`,true);
    if (optional && !available(name)) return null;
    requireProvider(name);
    const result = await dataProviders.get(name)!.get(id);
    if (result !== null) checkRecord(name,result,id);
    return present(name,result,wrapped);
  }
  async function query(name: string, q: string, input: unknown, optional: boolean, wrapped: boolean) {
    const schema = definition(name).queries?.[q];
    if (!schema) throw new ContractError(`Undefined query ${name}.${q}`);
    validate(schema.inputDataDefinition,input,`${name}.${q} input`,true);
    if (optional && !available(name)) return null;
    requireProvider(name);
    const results = await dataProviders.get(name)!.queries![q](input);
    if (!Array.isArray(results)) throw new ContractError(`${name}.${q} must return an array`);
    return results.map(result => { checkRecord(name,result); return present(name,result,wrapped); });
  }
  const semanticData = {
    isImplemented<K extends Name>(name: K): boolean { return available(name); },
    async get<K extends Name, W extends boolean = false>(name: K, id: Identifier<K>, options?: { includeContractNames?: W }): Promise<Result<K,W> | null> {
      return get(name,id,false,options?.includeContractNames === true);
    },
    async getOptional<K extends Name, W extends boolean = false>(name: K, id: Identifier<K>, options?: { includeContractNames?: W }): Promise<Result<K,W> | null> {
      return get(name,id,true,options?.includeContractNames === true);
    },
    async query<K extends Name, Q extends QueryName<K>, W extends boolean = false>(name: K, q: Q, input: QueryInput<K,Q>, options?: { includeContractNames?: W }): Promise<Result<K,W>[]> {
      return (await query(name,q,input,false,options?.includeContractNames === true))!;
    },
    async queryOptional<K extends Name, Q extends QueryName<K>, W extends boolean = false>(name: K, q: Q, input: QueryInput<K,Q>, options?: { includeContractNames?: W }): Promise<Result<K,W>[] | null> {
      return query(name,q,input,true,options?.includeContractNames === true);
    },
    async compose<K extends Name>(name: K, id: Identifier<K>): Promise<SemanticDataValue<K> | null> {
      const d = definition(name);
      if (!d.extensions) throw new ContractError(`${name} is not a composition`);
      if (d.dataDefinition) throw new ContractError(`${name} must assemble its own contribution explicitly`);
      validate(root(name).identifierDataDefinition!,id,`${name} identifier`,true);
      requireProvider(name);
      const records = await Promise.all(parts(name).map(n => get(n,id,false,false)));
      if (records.some(r => r === null)) return null;
      const result = Object.assign({},...records);
      checkRecord(name,result,id);
      return result;
    },
  };
  return { capabilities, semanticData };
}
export function createContracts(packages: readonly ContractPackage[]) { return createContractRuntime(resolveContractConfiguration(packages)); }
type Runtime = ReturnType<typeof createContracts>;
const shared = globalThis as typeof globalThis & { __voyzuContracts?: Runtime };
export function registerContracts(packages: readonly ContractPackage[]) { shared.__voyzuContracts = createContracts(packages); }
export function registerComposedContracts(configuration: ReturnType<typeof resolveContractConfiguration>) { shared.__voyzuContracts = createContractRuntime(configuration); }
function runtime(): Runtime {
  if (!shared.__voyzuContracts) throw new ContractError("Contracts have not been composed/registered for this instance");
  return shared.__voyzuContracts;
}
export const capabilities: Runtime["capabilities"] = {
  use: name => runtime().capabilities.use(name),
  optional: name => runtime().capabilities.optional(name),
  transaction: withTransaction,
};
export const semanticData: Runtime["semanticData"] = {
  isImplemented: name => runtime().semanticData.isImplemented(name),
  get: (name,id,options) => runtime().semanticData.get(name,id,options),
  getOptional: (name,id,options) => runtime().semanticData.getOptional(name,id,options),
  query: (name,q,input,options) => runtime().semanticData.query(name,q,input,options),
  queryOptional: (name,q,input,options) => runtime().semanticData.queryOptional(name,q,input,options),
  compose: (name,id) => runtime().semanticData.compose(name,id),
};
