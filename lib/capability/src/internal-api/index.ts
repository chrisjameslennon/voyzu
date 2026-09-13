import "server-only";
import type { Static, TSchema } from "typebox";
import Schema from "typebox/schema";
import type { InternalApiResource } from "@voyzu/types/internal-api";
import { InputValidationError } from "../errors";

/** Augmented by composition: callers never import provider packages. */
export interface InternalApiResources {}
type Resource = keyof InternalApiResources & string;
type Methods<R extends Resource> = InternalApiResources[R] extends { methods: infer M } ? M : never;
type Method<R extends Resource> = keyof Methods<R> & string;
type Input<R extends Resource, M extends Method<R>> = Methods<R>[M] extends { input: infer S extends TSchema } ? Static<S> : never;
type Output<R extends Resource, M extends Method<R>> = Methods<R>[M] extends { output: infer S extends TSchema } ? Static<S> : never;

export class InternalApiError extends Error {}
const unsafeNames = new Set(["__proto__", "prototype", "constructor"]);

/** Compose-time validation; does not load or invoke handlers. */
export function validateInternalApi(packages: readonly {
  name: string;
  internalApi?: readonly InternalApiResource[];
}[]): void {
  const resources = new Set<string>();
  for (const pkg of packages) {
    for (const definition of pkg.internalApi ?? []) {
      if (!definition.resource.startsWith(`${pkg.name}/`) || !definition.resource.slice(pkg.name.length + 1)
        || definition.resource.split("/").some(part => !part || part === "." || part === ".." || unsafeNames.has(part))) {
        throw new InternalApiError(`Invalid resource ${definition.resource} for ${pkg.name}`);
      }
      if (resources.has(definition.resource)) throw new InternalApiError(`Duplicate resource ${definition.resource}`);
      resources.add(definition.resource);
      if (!Object.keys(definition.methods).length) throw new InternalApiError(`${definition.resource} requires methods`);
      for (const [name, method] of Object.entries(definition.methods)) {
        if (!name || unsafeNames.has(name)) throw new InternalApiError(`Invalid method ${name}`);
        if (!method.input || !method.output || typeof method.loadHandler !== "function") {
          throw new InternalApiError(`${definition.resource}.${name} requires input, output and loadHandler`);
        }
        if (method.transactional !== undefined && typeof method.transactional !== "boolean") {
          throw new InternalApiError(`${definition.resource}.${name} has invalid transactional setting`);
        }
        Schema.Compile(method.input);
        Schema.Compile(method.output);
      }
    }
  }
}

export function createInternalApi(resources: readonly InternalApiResource[]) {
  const registry = new Map<string, InternalApiResource>();
  for (const resource of resources) {
    if (registry.has(resource.resource)) throw new InternalApiError(`Duplicate resource ${resource.resource}`);
    registry.set(resource.resource, resource);
  }
  const validators = new Map<TSchema, ReturnType<typeof Schema.Compile>>();
  function validate(schema: TSchema, value: unknown, label: string, input: boolean) {
    let validator = validators.get(schema);
    if (!validator) { validator = Schema.Compile(schema); validators.set(schema, validator); }
    if (!validator.Check(value)) {
      if (input) throw new InputValidationError(`Invalid ${label}`);
      throw new InternalApiError(`Invalid ${label}`);
    }
  }
  return {
    async call<R extends Resource, M extends Method<R>>(resource: R, method: M, input: Input<R, M>): Promise<Output<R, M>> {
      const definition = registry.get(resource);
      if (!definition) throw new InternalApiError(`Unknown resource ${resource}`);
      if (!Object.hasOwn(definition.methods, method)) throw new InternalApiError(`Unknown method ${resource}.${method}`);
      const operation = definition.methods[method];
      validate(operation.input, input, `${resource}.${method} input`, true);
      const execute = async () => {
        const handler = await operation.loadHandler();
        const result = await handler(input);
        // Validate before committing a transaction so an invalid response rolls back.
        validate(operation.output, result, `${resource}.${method} output`, false);
        return result as Output<R, M>;
      };
      if (operation.transactional) {
        const { withTransaction } = await import("../db/db");
        return withTransaction(() => execute());
      }
      return execute();
    },
  };
}

const shared = globalThis as typeof globalThis & { __voyzuInternalApi?: ReturnType<typeof createInternalApi> };

/** Replace the registry atomically on reload, rather than accumulating stale registrations. */
export function registerInternalApi(resources: readonly InternalApiResource[]): void {
  shared.__voyzuInternalApi = createInternalApi(resources);
}

export const internalApi = {
  async call<R extends Resource, M extends Method<R>>(resource: R, method: M, input: Input<R, M>): Promise<Output<R, M>> {
    if (!shared.__voyzuInternalApi) throw new InternalApiError("Cross-package API is not initialized; run voyzu:compose and load its registry");
    return shared.__voyzuInternalApi.call(resource, method, input);
  },
};
