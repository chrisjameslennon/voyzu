import "server-only";

import type { TSchema } from "typebox";
import Schema, { type Validator } from "typebox/schema";

import { InputValidationError } from "../errors";

export interface VoyzuOperationDefinition {
  parameters: TSchema;
  result: TSchema;
}

type OperationHandler = (...args: any[]) => any;
type OperationLoader = () => Promise<OperationHandler>;
type LoadedOperation<TLoader extends OperationLoader> = Awaited<ReturnType<TLoader>>;
type LazyOperation<TLoader extends OperationLoader> = (
  ...args: Parameters<LoadedOperation<TLoader>>
) => Promise<Awaited<ReturnType<LoadedOperation<TLoader>>>>;

type DefinedOperation = {
  handler: OperationHandler;
  definition: VoyzuOperationDefinition;
};

type RegisteredOperation = DefinedOperation & {
  name: string;
  packageName: string;
  moduleName: string;
  operationName: string;
};

type OperationRegistryState = {
  definitions: WeakMap<OperationHandler, DefinedOperation>;
  registry: Map<string, RegisteredOperation>;
};

const operationGlobal = globalThis as typeof globalThis & {
  __voyzuOperationRegistry?: OperationRegistryState;
};

operationGlobal.__voyzuOperationRegistry ??= {
  definitions: new WeakMap<OperationHandler, DefinedOperation>(),
  registry: new Map<string, RegisteredOperation>(),
};

const { definitions, registry } = operationGlobal.__voyzuOperationRegistry;

function messages(validator: Validator, value: unknown, path: string): string[] {
  return validator.Errors(value)[1].map((error) =>
    `${path}${error.instancePath} ${error.message}`.trim(),
  );
}

function invalidResult(name: string, errors: readonly string[]): void {
  const message = `Invalid result from ${name}: ${errors.join("; ")}`;
  if (process.env.NODE_ENV !== "production") throw new Error(message);
  console.error(message);
}

function defineLazy<TLoader extends OperationLoader>(
  definition: VoyzuOperationDefinition,
  loadHandler: TLoader,
): LazyOperation<TLoader> {
  let loadedHandler: Promise<OperationHandler> | undefined;
  let validators: { parameter: Validator; result: Validator } | undefined;

  const getHandler = () => {
    loadedHandler ??= loadHandler();
    return loadedHandler;
  };

  const getValidators = () => {
    validators ??= {
      parameter: Schema.Compile(definition.parameters),
      result: Schema.Compile(definition.result),
    };
    return validators;
  };

  const wrapped = async (...args: unknown[]): Promise<unknown> => {
    const operationValidators = getValidators();
    if (!operationValidators.parameter.Check(args)) {
      throw new InputValidationError(
        `Invalid operation arguments: ${messages(operationValidators.parameter, args, "parameters").join("; ")}`,
      );
    }

    const handler = await getHandler();
    const result = await handler(...args);
    if (!operationValidators.result.Check(result)) {
      invalidResult("operation", messages(operationValidators.result, result, "result"));
    }
    return result;
  };

  definitions.set(wrapped, {
    handler: wrapped,
    definition,
  });
  return wrapped as LazyOperation<TLoader>;
}

function registerModule(
  packageName: string,
  moduleName: string,
  moduleOperations: Readonly<Record<string, OperationHandler>>,
): () => void {
  const registeredNames: string[] = [];

  for (const [operationName, handler] of Object.entries(moduleOperations)) {
    const defined = definitions.get(handler);
    if (!defined) continue;

    const name = `${packageName}.${operationName}`;
    const existing = registry.get(name);
    if (existing && existing.moduleName !== moduleName) {
      throw new Error(
        `Duplicate operation ${name} is exported by ${existing.moduleName} and ${moduleName}`,
      );
    }

    registry.set(name, {
      ...defined,
      name,
      packageName,
      moduleName,
      operationName,
    });
    registeredNames.push(name);
  }

  return () => {
    for (const name of registeredNames) {
      if (registry.get(name)?.moduleName === moduleName) registry.delete(name);
    }
  };
}

async function callOptional(name: string, ...args: unknown[]): Promise<unknown | undefined> {
  const registered = registry.get(name);
  return registered ? registered.handler(...args) : undefined;
}

async function call(name: string, ...args: unknown[]): Promise<unknown> {
  const registered = registry.get(name);
  if (!registered) throw new Error(`Operation ${name} is not available`);
  return registered.handler(...args);
}

function has(name: string): boolean {
  return registry.has(name);
}

export const operation = {
  defineLazy,
  registerModule,
  callOptional,
  call,
  has,
} as const;
