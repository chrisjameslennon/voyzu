import Schema, { type Validator } from "typebox/schema";

import type { DbExecutor } from "../db";
import type { VoyzuEventDefinition, VoyzuModuleEvents } from "@voyzu/types/framework";

export interface VoyzuEventContext {
  /** Internal executor for the transaction that raised the event. */
  transaction: DbExecutor;
}

export type VoyzuEventHandler<TPayload = unknown> = (
  payload: TPayload,
  context: VoyzuEventContext,
) => void | Promise<void>;

type RegisteredEvent = {
  name: string;
  definition: VoyzuEventDefinition;
  validator: Validator;
};

type EventRegistryState = {
  eventRegistry: WeakMap<object, RegisteredEvent>;
  listenerRegistry: Map<string, Set<VoyzuEventHandler>>;
};

const eventGlobal = globalThis as typeof globalThis & {
  __voyzuEventRegistry?: EventRegistryState;
};
eventGlobal.__voyzuEventRegistry ??= {
  eventRegistry: new WeakMap<object, RegisteredEvent>(),
  listenerRegistry: new Map<string, Set<VoyzuEventHandler>>(),
};
const { eventRegistry, listenerRegistry } = eventGlobal.__voyzuEventRegistry;

function registerModule(
  packageName: string,
  moduleName: string,
  moduleEvents: VoyzuModuleEvents,
): () => void {
  const registered: object[] = [];

  for (const [eventKey, definition] of Object.entries(moduleEvents)) {
    const name = `${packageName}.${moduleName}.${eventKey}`;
    eventRegistry.set(definition, {
      name,
      definition,
      validator: Schema.Compile(definition.payload),
    });
    registered.push(definition);
  }

  return () => {
    for (const definition of registered) eventRegistry.delete(definition);
  };
}

function listen<TPayload>(eventName: string, handler: VoyzuEventHandler<TPayload>): () => void {
  const handlers = listenerRegistry.get(eventName) ?? new Set<VoyzuEventHandler>();
  handlers.add(handler as VoyzuEventHandler);
  listenerRegistry.set(eventName, handlers);

  return () => {
    handlers.delete(handler as VoyzuEventHandler);
    if (handlers.size === 0) listenerRegistry.delete(eventName);
  };
}

async function dispatch<TPayload>(
  definition: VoyzuEventDefinition,
  payload: TPayload,
  context: VoyzuEventContext,
): Promise<void> {
  const registered = eventRegistry.get(definition);
  const validator = registered?.validator ?? Schema.Compile(definition.payload);

  if (!validator.Check(payload)) {
    const messages = validator.Errors(payload)[1]
      .map((error) => `${error.instancePath} ${error.message}`.trim());
    const eventName = registered?.name ?? "unregistered event";
    throw new Error(`Invalid payload for ${eventName}: ${messages.join("; ")}`);
  }

  if (!registered) return;
  for (const handler of listenerRegistry.get(registered.name) ?? []) {
    await handler(payload, context);
  }
}

export const events = {
  registerModule,
  listen,
  dispatch,
} as const;
