import "server-only";

import type { ComponentType, ReactNode } from "react";

export type VoyzuComponent = (props: Record<string, unknown>) => ReactNode | Promise<ReactNode>;
export type VoyzuComponentLoader = () => Promise<VoyzuComponent>;

export interface VoyzuComponentDefinition {
  id: string;
  loadComponent: VoyzuComponentLoader;
}

type RegisteredComponent = VoyzuComponentDefinition & {
  packageName: string;
  moduleName: string;
  componentName: string;
};

type ComponentRegistryState = {
  registry: Map<string, RegisteredComponent>;
};

const componentGlobal = globalThis as typeof globalThis & {
  __voyzuComponentRegistry?: ComponentRegistryState;
};

componentGlobal.__voyzuComponentRegistry ??= { registry: new Map() };
const { registry } = componentGlobal.__voyzuComponentRegistry;

function defineLazy(id: string, loadComponent: VoyzuComponentLoader): VoyzuComponentDefinition {
  return { id, loadComponent };
}

function registerModule(
  packageName: string,
  moduleName: string,
  moduleComponents: Readonly<Record<string, VoyzuComponentDefinition>>,
): void {
  for (const [componentName, definition] of Object.entries(moduleComponents)) {
    const existing = registry.get(definition.id);
    if (existing && (
      existing.packageName !== packageName
      || existing.moduleName !== moduleName
      || existing.componentName !== componentName
    )) {
      throw new Error(
        `Duplicate component slot ${definition.id} is exported by ${existing.packageName}/${existing.moduleName} and ${packageName}/${moduleName}`,
      );
    }
    registry.set(definition.id, {
      ...definition,
      packageName,
      moduleName,
      componentName,
    });
  }
}

function has(id: string): boolean {
  return registry.has(id);
}

export async function ComponentSlot({
  id,
  ...props
}: { id: string } & Record<string, unknown>) {
  const registered = registry.get(id);
  if (!registered) return null;
  const Component = await registered.loadComponent() as ComponentType<Record<string, unknown>>;
  return <Component {...props} />;
}

export const component = {
  defineLazy,
  registerModule,
  has,
} as const;
