import "server-only";
import type { Static, TSchema } from "typebox";
import Schema from "typebox/schema";
import type { CapabilityContract, MasterDataContract, MasterDataComposition, PackageContracts } from "@voyzu/types/contracts";
import { withTransaction } from "../db/db";
import { InputValidationError } from "../errors";

/** Augmented by the composed instance, not by direct provider imports. */
export interface CapabilityContracts {}
export interface MasterDataContracts {}
export interface MasterDataCompositions {}
type Root<K extends keyof MasterDataCompositions> = MasterDataCompositions[K] extends { root: infer R extends keyof MasterDataContracts } ? R : never;
type NamedData<K extends keyof MasterDataCompositions> = {
  [P in MasterDataContracts[Root<K>] extends { key: infer A extends string } ? A : "data"]: Data<Root<K>>;
} & {
  [E in MasterDataCompositions[K] extends { extensions: readonly (infer N extends keyof MasterDataContracts)[] } ? N : never as MasterDataContracts[E] extends { extends: { key: infer A extends string } } ? A : never]: Data<E> | null;
};
type DataName = keyof MasterDataContracts | keyof MasterDataCompositions;
type GetId<K extends DataName> = K extends keyof MasterDataContracts ? Id<K> : K extends keyof MasterDataCompositions ? Id<Root<K>> : never;
type GetData<K extends DataName> = K extends keyof MasterDataContracts ? Data<K> : K extends keyof MasterDataCompositions ? NamedData<K> : never;
/** Type-only access to the composed master-data shape, including from client code. */
export type MasterDataValue<K extends DataName> = GetData<K>;
type ListName = { [K in keyof MasterDataContracts]: MasterDataContracts[K] extends { list: true } ? K : never }[keyof MasterDataContracts];
type CapabilityMethods<C> = {
  [M in keyof C]: C[M] extends { input: infer I extends TSchema; output: infer O extends TSchema }
    ? (input: Static<I>) => Promise<Static<O>> : never;
};
type Data<K extends keyof MasterDataContracts> = MasterDataContracts[K] extends { data: infer S extends TSchema } ? Static<S> : never;
type Id<K extends keyof MasterDataContracts> = MasterDataContracts[K] extends { id: infer S extends TSchema } ? Static<S> : never;
type Extensions<K> = {
  [E in keyof MasterDataContracts as MasterDataContracts[E] extends { extends: { root: K; key: infer A extends string } } ? A : never]?: Data<E>;
};
type Methods = Readonly<Record<string, (input: any) => Promise<any>>>;
type Composed<K extends keyof MasterDataContracts> = {
  [P in MasterDataContracts[K] extends { key: infer Key extends string } ? Key : "data"]: Data<K>;
} & { extensions: Extensions<K> };
export type ContractPackage = { name: string; contracts?: PackageContracts };

export class ContractError extends Error {}

function validate(schema: TSchema, value: unknown, label: string, input = false) {
  const validator = Schema.Compile(schema);
  if (validator.Check(value)) return;
  const message = `${label}: ${validator.Errors(value)[1].map((e) => `${e.instancePath} ${e.message}`).join("; ")}`;
  if (input) throw new InputValidationError(message);
  // Invalid provider output must fail inside the transaction, including in production.
  throw new ContractError(message);
}

/** Pure registration/validation: never calls providers or touches the database. */
export function resolveContractConfiguration(packages: readonly ContractPackage[]) {
  const capabilityDefinitions = new Map<string, CapabilityContract>();
  const dataDefinitions = new Map<string, MasterDataContract>();
  const compositions = new Map<string, MasterDataComposition>();
  const capabilityProviders = new Map<string, NonNullable<NonNullable<PackageContracts["implements"]>["capabilities"]>[string]>();
  const dataProviders = new Map<string, NonNullable<NonNullable<PackageContracts["implements"]>["masterData"]>[string]>();
  const owners = new Map<string, string>();
  function add<T>(map: Map<string, T>, kind: string, name: string, value: T, owner: string) {
    const key = `${kind}:${name}`;
    if (map.has(name)) throw new ContractError(`Duplicate ${kind} ${name}: ${owners.get(key)} and ${owner}`);
    map.set(name, value); owners.set(key, owner);
  }
  for (const pkg of packages) {
    for (const [name, definition] of Object.entries(pkg.contracts?.defines?.capabilities ?? {})) {
      if (!Object.keys(definition).length) throw new ContractError(`Capability ${name} has no methods`);
      for (const method of Object.values(definition)) {
        if (!("type" in method.input) || method.input.type !== "object" || !("type" in method.output) || method.output.type !== "object") throw new ContractError(`${name} methods require object input and output schemas`);
        Schema.Compile(method.input); Schema.Compile(method.output);
      }
      add(capabilityDefinitions, "capability definition", name, definition, pkg.name);
    }
    for (const [name, definition] of Object.entries(pkg.contracts?.defines?.masterData ?? {})) {
      Schema.Compile(definition.id); Schema.Compile(definition.data);
      if (definition.key && ["extensions", "__proto__", "prototype", "constructor"].includes(definition.key)) throw new ContractError(`Invalid root key ${definition.key}`);
      add(dataDefinitions, "master-data definition", name, definition, pkg.name);
    }
    for (const [name, provider] of Object.entries(pkg.contracts?.implements?.capabilities ?? {})) {
      if (typeof provider.load !== "function") throw new ContractError(`${name} requires a provider loader`);
      add(capabilityProviders, "capability provider", name, provider, pkg.name);
    }
    for (const [name, definition] of Object.entries(pkg.contracts?.defines?.compositions ?? {})) {
      add(compositions, "master-data composition", name, definition, pkg.name);
    }
    for (const [name, provider] of Object.entries(pkg.contracts?.implements?.masterData ?? {})) {
      if (typeof provider.get !== "function") throw new ContractError(`${name} requires a master-data getter`);
      add(dataProviders, "master-data provider", name, provider, pkg.name);
    }
  }
  for (const name of capabilityProviders.keys()) if (!capabilityDefinitions.has(name)) throw new ContractError(`Undefined capability ${name}`);
  for (const name of dataProviders.keys()) if (!dataDefinitions.has(name)) throw new ContractError(`Undefined master data ${name}`);
  for (const [name, provider] of dataProviders) {
    if (dataDefinitions.get(name)?.list && typeof provider.list !== "function") throw new ContractError(`${name} requires a master-data list provider`);
    if (provider.list && !dataDefinitions.get(name)?.list) throw new ContractError(`${name} does not declare listing`);
  }
  const extensionKeys = new Set<string>();
  for (const [name, definition] of dataDefinitions) {
    if (!definition.extends) continue;
    const { root, key } = definition.extends;
    if (!dataDefinitions.has(root) || dataDefinitions.get(root)?.extends) throw new ContractError(`Invalid root ${root} for ${name}`);
    if (!key || ["__proto__", "prototype", "constructor"].includes(key)) throw new ContractError(`Invalid extension key ${key}`);
    if (extensionKeys.has(`${root}:${key}`)) throw new ContractError(`Duplicate extension key ${root}.${key}`);
    extensionKeys.add(`${root}:${key}`);
  }
  for (const [name, composition] of compositions) {
    if (dataDefinitions.has(name)) throw new ContractError(`Composition ${name} conflicts with master data`);
    const root = dataDefinitions.get(composition.root);
    if (!root || root.extends) throw new ContractError(`Invalid root ${composition.root} for ${name}`);
    const keys = new Set([root.key ?? "data"]);
    for (const extension of composition.extensions) {
      const definition = dataDefinitions.get(extension);
      if (definition?.extends?.root !== composition.root) throw new ContractError(`${extension} does not extend ${composition.root}`);
      if (keys.has(definition.extends.key)) throw new ContractError(`Duplicate composition key ${name}.${definition.extends.key}`);
      keys.add(definition.extends.key);
    }
  }
  return { capabilityDefinitions, dataDefinitions, capabilityProviders, dataProviders, compositions };
}

/** Load compose-validated configuration; request/response validation still runs on every call. */
function createContractRuntime(configuration: ReturnType<typeof resolveContractConfiguration>) {
  const { capabilityDefinitions, dataDefinitions, capabilityProviders, dataProviders, compositions } = configuration;
  const loaded = new Map<string, Promise<Methods>>();
  function optional<K extends keyof CapabilityContracts & string>(name: K): CapabilityMethods<CapabilityContracts[K]> | undefined {
    const definition = capabilityDefinitions.get(name);
    if (!definition) throw new ContractError(`Undefined capability ${name}`);
    const provider = capabilityProviders.get(name);
    if (!provider) return undefined;
    const methods: Record<string, (input: unknown) => Promise<unknown>> = Object.create(null);
    for (const [methodName, method] of Object.entries(definition)) {
      methods[methodName] = async (input) => {
        validate(method.input, input, `${name}.${methodName} input`, true);
        const invoke = async () => {
          let promise = loaded.get(name);
          if (!promise) {
            promise = provider.load(); loaded.set(name, promise);
            promise.catch(() => loaded.delete(name));
          }
          const implementation = await promise;
          if (typeof implementation[methodName] !== "function") throw new ContractError(`Missing provider method ${name}.${methodName}`);
          const result = await implementation[methodName](input);
          validate(method.output, result, `${name}.${methodName} output`);
          return result;
        };
        return method.transactional ? withTransaction(invoke) : invoke();
      };
    }
    return methods as CapabilityMethods<CapabilityContracts[K]>;
  }
  const capabilities = {
    optional,
    use<K extends keyof CapabilityContracts & string>(name: K) {
      const provider = optional(name);
      if (!provider) throw new ContractError(`No implementation for capability ${name}`);
      return provider;
    },
    /** Keep transaction executors outside JSON contracts; nested calls join automatically. */
    transaction: withTransaction,
  };
  async function getRaw(name: string, id: unknown): Promise<unknown> {
    const definition = dataDefinitions.get(name);
    if (!definition) throw new ContractError(`Undefined master data ${name}`);
    const provider = dataProviders.get(name);
    if (!provider) throw new ContractError(`No implementation for master data ${name}`);
    validate(definition.id, id, `${name} id`, true);
    const result = await provider.get(id);
    if (result !== null) validate(definition.data, result, `${name} data`);
    return result;
  }
  const masterData = {
    async get<K extends DataName & string>(name: K, id: GetId<K>): Promise<GetData<K> | null> {
      const composition = compositions.get(name);
      if (!composition) return await getRaw(name, id) as GetData<K> | null;
      // Missing implementations are configuration errors, even for an absent root record.
      for (const part of [composition.root, ...composition.extensions]) {
        if (!dataProviders.has(part)) throw new ContractError(`No implementation for master data ${part}`);
      }
      const root = await getRaw(composition.root, id);
      if (root === null) return null;
      const result: Record<string, unknown> = { [dataDefinitions.get(composition.root)!.key ?? "data"]: root };
      for (const extension of composition.extensions) result[dataDefinitions.get(extension)!.extends!.key] = await getRaw(extension, id);
      return result as GetData<K>;
    },
    async list<K extends ListName & string>(name: K): Promise<Data<K>[]> {
      const definition = dataDefinitions.get(name);
      if (!definition?.list) throw new ContractError(`${name} does not declare listing`);
      const provider = dataProviders.get(name);
      if (!provider?.list) throw new ContractError(`No list implementation for master data ${name}`);
      const rows = await provider.list();
      if (!Array.isArray(rows)) throw new ContractError(`${name} list must return an array`);
      for (const row of rows) validate(definition.data, row, `${name} list data`);
      return rows as Data<K>[];
    },
    async compose<K extends keyof MasterDataContracts & string>(name: K, id: Id<K>, requestedExtensions?: readonly (keyof MasterDataContracts & string)[]): Promise<Composed<K> | null> {
      const definition = dataDefinitions.get(name);
      if (!definition || definition.extends) throw new ContractError(`${name} is not a master-data root`);
      const names = requestedExtensions ?? [...dataDefinitions].filter(([n, d]) => d.extends?.root === name && dataProviders.has(n)).map(([n]) => n);
      // Validate explicit requests even when the root record does not exist.
      for (const extension of names) {
        if (dataDefinitions.get(extension)?.extends?.root !== name) throw new ContractError(`${extension} does not extend ${name}`);
        if (!dataProviders.has(extension)) throw new ContractError(`No implementation for master data ${extension}`);
      }
      const root = await getRaw(name, id);
      if (root === null) return null;
      const extensions: Record<string, unknown> = {};
      for (const extension of names) {
        const data = await getRaw(extension, id);
        if (data !== null) extensions[dataDefinitions.get(extension)!.extends!.key] = data;
      }
      return { [definition.key ?? "data"]: root, extensions } as Composed<K>;
    },
  };
  return { capabilities, masterData };
}

/** Validated programmatic registration, used by isolated integration tests. */
export function createContracts(packages: readonly ContractPackage[]) {
  return createContractRuntime(resolveContractConfiguration(packages));
}
type Runtime = ReturnType<typeof createContracts>;
const shared = globalThis as typeof globalThis & { __voyzuContracts?: Runtime };
export function registerContracts(packages: readonly ContractPackage[]) { shared.__voyzuContracts = createContracts(packages); }
/** Only generated compose output should call this; structural checks belong to compose. */
export function registerComposedContracts(configuration: ReturnType<typeof resolveContractConfiguration>) {
  shared.__voyzuContracts = createContractRuntime(configuration);
}
function runtime(): Runtime {
  if (!shared.__voyzuContracts) throw new ContractError("Contracts have not been composed/registered for this instance");
  return shared.__voyzuContracts;
}
export const capabilities: Runtime["capabilities"] = {
  use: (name) => runtime().capabilities.use(name),
  optional: (name) => runtime().capabilities.optional(name),
  transaction: withTransaction,
};
export const masterData: Runtime["masterData"] = {
  get: (name, id) => runtime().masterData.get(name, id),
  list: (name) => runtime().masterData.list(name),
  compose: (name, id, extensions) => runtime().masterData.compose(name, id, extensions),
};
