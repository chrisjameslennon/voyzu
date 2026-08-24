import "server-only";

import type { TSchema } from "typebox";
import Schema, { type Validator } from "typebox/schema";

import { InputValidationError } from "../errors";

export interface VoyzuOperationDefinition {
  parameters: TSchema;
  result: TSchema;
}

type OperationHandler = (...args: any[]) => any;

type DefinedOperation = {
  handler: OperationHandler;
  definition: VoyzuOperationDefinition;
  parameterValidator: Validator;
  resultValidator: Validator;
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

function define<TArgs extends unknown[], TResult>(
  definition: VoyzuOperationDefinition,
  handler: (...args: TArgs) => TResult,
): (...args: TArgs) => Promise<Awaited<TResult>> {
  const parameterValidator = Schema.Compile(definition.parameters);
  const resultValidator = Schema.Compile(definition.result);

  const wrapped = async (...args: TArgs): Promise<Awaited<TResult>> => {
    if (!parameterValidator.Check(args)) {
      throw new InputValidationError(
        `Invalid operation arguments: ${messages(parameterValidator, args, "parameters").join("; ")}`,
      );
    }

    const result = await handler(...args);
    if (!resultValidator.Check(result)) {
      invalidResult("operation", messages(resultValidator, result, "result"));
    }
    return result as Awaited<TResult>;
  };

  definitions.set(wrapped, {
    handler: wrapped,
    definition,
    parameterValidator,
    resultValidator,
  });
  return wrapped;
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

export const operation = {
  define,
  registerModule,
  callOptional,
  call,
} as const;
