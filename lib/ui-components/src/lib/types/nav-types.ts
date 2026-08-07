import type { ReactNode } from "react";

export enum ViewMode {
  GLOBAL = 'GLOBAL',
  COMPANY = 'COMPANY'
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
  viewMode?: ViewMode;
  exactMatch?: boolean;
  endContent?: ReactNode;
  children?: NavItem[];
}

export interface NavSection {
  label: string;
  landingPath: string;
  items: NavItem[];
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}
