import type { ComponentType } from "react";

export interface UiSurfaceMenuItem {
  label: string;
  icon?: string;
  routeId?: string;
  /** Placeholder destination within a package-owned root; no registered page required. */
  path?: string;
  exactMatch?: boolean;
  children?: Readonly<Record<string, UiSurfaceMenuItem>>;
}

export interface UiSurfaceMenuGroup {
  label?: string;
  items: Readonly<Record<string, UiSurfaceMenuItem>>;
}

export interface UiSurfaceHeaderProps {
  presentation: "expanded" | "collapsed" | "mobile";
}

export interface UiSurface {
  "topnav.menu"?: Readonly<Record<string, {
    label: string;
    routeId: string;
  }>>;
  "leftnav.menu"?: Readonly<Record<string, {
    content: readonly UiSurfaceMenuGroup[];
  }>>;
  "leftnav.header"?: Readonly<Record<string, {
    loadComponent: () => Promise<ComponentType<UiSurfaceHeaderProps>>;
  }>>;
}
