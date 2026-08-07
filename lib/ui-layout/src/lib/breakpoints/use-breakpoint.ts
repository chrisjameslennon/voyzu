"use client";

import { useEffect, useState } from "react";

import { Breakpoints } from "./breakpoints";

export type BreakpointZone = "mobile" | "tablet" | "desktop";

/**
 * Subscribe to the current viewport zone. Re-renders on zone change.
 * SSR-safe: returns "desktop" on the server, corrected after hydration.
 */
export function useBreakpoint(): BreakpointZone {
  const [zone, setZone] = useState<BreakpointZone>("desktop");

  useEffect(() => {
    setZone(Breakpoints.current());
    return Breakpoints.onChange(setZone);
  }, []);

  return zone;
}

export function useIsMobile(): boolean {
  return useBreakpoint() === "mobile";
}

export function useIsTablet(): boolean {
  return useBreakpoint() === "tablet";
}

export function useIsTabletUp(): boolean {
  return useBreakpoint() !== "mobile";
}
