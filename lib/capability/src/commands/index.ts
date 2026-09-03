import "server-only";

import type { TSchema } from "typebox";
import Schema, { type Validator } from "typebox/schema";

import { InputValidationError } from "../errors";

export interface VoyzuCommandDefinition {
  parameters: TSchema;
  result: TSchema;
}

type CommandHandler = (...args: any[]) => any;
type CommandLoader = () => Promise<CommandHandler>;
type LoadedCommand<TLoader extends CommandLoader> = Awaited<ReturnType<TLoader>>;
type LazyCommand<TLoader extends CommandLoader> = (
  ...args: Parameters<LoadedCommand<TLoader>>
) => Promise<Awaited<ReturnType<LoadedCommand<TLoader>>>>;

type DefinedCommand = {
  handler: CommandHandler;
  definition: VoyzuCommandDefinition;
};

type RegisteredCommand = DefinedCommand & {
  name: string;
  packageName: string;
  moduleName: string;
  commandName: string;
};

type CommandRegistryState = {
  definitions: WeakMap<CommandHandler, DefinedCommand>;
  registry: Map<string, RegisteredCommand>;
};

const commandGlobal = globalThis as typeof globalThis & {
  __voyzuCommandRegistry?: CommandRegistryState;
};

commandGlobal.__voyzuCommandRegistry ??= {
  definitions: new WeakMap<CommandHandler, DefinedCommand>(),
  registry: new Map<string, RegisteredCommand>(),
};

const { definitions, registry } = commandGlobal.__voyzuCommandRegistry;

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

function defineLazy<TLoader extends CommandLoader>(
  definition: VoyzuCommandDefinition,
  loadHandler: TLoader,
): LazyCommand<TLoader> {
  let loadedHandler: Promise<CommandHandler> | undefined;
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
    const commandValidators = getValidators();
    if (!commandValidators.parameter.Check(args)) {
      throw new InputValidationError(
        `Invalid command arguments: ${messages(commandValidators.parameter, args, "parameters").join("; ")}`,
      );
    }

    const handler = await getHandler();
    const result = await handler(...args);
    if (!commandValidators.result.Check(result)) {
      invalidResult("command", messages(commandValidators.result, result, "result"));
    }
    return result;
  };

  definitions.set(wrapped, {
    handler: wrapped,
    definition,
  });
  return wrapped as LazyCommand<TLoader>;
}

function registerModule(
  packageName: string,
  moduleName: string,
  moduleCommands: Readonly<Record<string, CommandHandler>>,
): () => void {
  const registeredNames: string[] = [];

  for (const [commandName, handler] of Object.entries(moduleCommands)) {
    const defined = definitions.get(handler);
    if (!defined) continue;

    const name = `${packageName}.${commandName}`;
    const existing = registry.get(name);
    if (existing && existing.moduleName !== moduleName) {
      throw new Error(
        `Duplicate command ${name} is exported by ${existing.moduleName} and ${moduleName}`,
      );
    }

    registry.set(name, {
      ...defined,
      name,
      packageName,
      moduleName,
      commandName,
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
  if (!registered) throw new Error(`Command ${name} is not available`);
  return registered.handler(...args);
}

function has(name: string): boolean {
  return registry.has(name);
}

export const command = {
  defineLazy,
  registerModule,
  callOptional,
  call,
  has,
} as const;
