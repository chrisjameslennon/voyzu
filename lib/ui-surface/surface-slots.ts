// lib/ui-surface/surface-slots.ts

import type { ReactNode } from "react";

export const VOYZU_SURFACE_SLOT_IDS = [
  // Top bar
  "top.brand",
  "top.primaryNav",
  "top.context",

  // Top-right utility/action area
  "top.utility.settings",
  "top.utility.help",
  "top.user",

  // Left surface
  "left.context",
  "left.nav",

  // Main content surface
  "main",

  // Optional future areas
  "right.panel",
  "footer",
] as const;

export type VoyzuSurfaceSlotId =
  (typeof VOYZU_SURFACE_SLOT_IDS)[number];

export type VoyzuSurfaceSlots = Partial<
  Record<VoyzuSurfaceSlotId, ReactNode>
>;

export const VOYZU_TOP_SLOT_IDS = [
  "top.brand",
  "top.primaryNav",
  "top.context",
  "top.utility.settings",
  "top.utility.help",
  "top.user",
] as const satisfies readonly VoyzuSurfaceSlotId[];

export const VOYZU_TOP_UTILITY_SLOT_IDS = [
  "top.utility.settings",
  "top.utility.help",
  "top.user",
] as const satisfies readonly VoyzuSurfaceSlotId[];

export const VOYZU_LEFT_SLOT_IDS = [
  "left.context",
  "left.nav",
] as const satisfies readonly VoyzuSurfaceSlotId[];

export interface VoyzuSurfaceSlotProps {
  slotId: VoyzuSurfaceSlotId;
  children?: ReactNode;
}

export function getSurfaceSlot(
  slots: VoyzuSurfaceSlots,
  slotId: VoyzuSurfaceSlotId,
): ReactNode {
  return slots[slotId] ?? null;
}

export function hasSurfaceSlot(
  slots: VoyzuSurfaceSlots,
  slotId: VoyzuSurfaceSlotId,
): boolean {
  return slots[slotId] !== undefined && slots[slotId] !== null;
}
