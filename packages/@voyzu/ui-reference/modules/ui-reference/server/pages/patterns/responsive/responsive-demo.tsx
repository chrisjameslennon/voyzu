"use client";

import { useBreakpoint, useIsMobile, useIsTablet, useIsTabletUp } from "@voyzu/ui-layout";

const ZONE_STYLE: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  mobile:  { bg: "#fef3c7", border: "#f59e0b", text: "#92400e", icon: "phone_iphone" },
  tablet:  { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af", icon: "tablet_mac" },
  desktop: { bg: "#d1fae5", border: "#10b981", text: "#065f46", icon: "computer" },
};

const ZONE_DESC: Record<string, string> = {
  mobile:  "< 768px — narrow viewport",
  tablet:  "768–1199px — medium viewport",
  desktop: "≥ 1200px — wide viewport",
};

export function ResponsiveDemo() {
  const zone    = useBreakpoint();
  const isMobile   = useIsMobile();
  const isTablet   = useIsTablet();
  const isTabletUp = useIsTabletUp();
  const s = ZONE_STYLE[zone]!;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Zone badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 8 }}>
        <span className="material-symbols-outlined" style={{ color: s.text, fontSize: "2rem" }}>{s.icon}</span>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: "0.875rem", color: s.text, textTransform: "uppercase", letterSpacing: "0.07em" }}>{zone}</p>
          <p style={{ margin: "0.125rem 0 0", fontSize: "0.8125rem", color: s.text, opacity: 0.8 }}>{ZONE_DESC[zone]}</p>
        </div>
        <span style={{ fontSize: "0.75rem", fontFamily: "ui-monospace, Menlo, monospace", color: s.text, opacity: 0.65 }}>resize to see changes</span>
      </div>

      {/* Hook results */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.625rem" }}>
        {[
          { hook: "useIsMobile()",   value: isMobile },
          { hook: "useIsTablet()",   value: isTablet },
          { hook: "useIsTabletUp()", value: isTabletUp },
          { hook: "useBreakpoint()", value: `"${zone}"` },
        ].map(({ hook, value }) => (
          <div key={hook} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "var(--voyzu-color-surface-muted)", border: "1px solid var(--voyzu-color-border)", borderRadius: 6 }}>
            <code style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.75rem", color: "var(--voyzu-color-text-secondary)" }}>{hook}</code>
            <code style={{ fontFamily: "ui-monospace, Menlo, monospace", fontSize: "0.8125rem", fontWeight: 700, color: value === true ? "var(--voyzu-color-success-text)" : value === false ? "var(--voyzu-color-text-secondary)" : "var(--voyzu-color-brand)" }}>
              {String(value)}
            </code>
          </div>
        ))}
      </div>

      {/* Conditional content example */}
      <div style={{ padding: "1rem 1.25rem", border: "1px solid var(--voyzu-color-border)", borderRadius: 8, fontSize: "0.875rem", color: "var(--voyzu-color-text)" }}>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--voyzu-color-text-secondary)" }}>Conditional render output</p>
        {isMobile && <p style={{ margin: 0 }}>Showing <strong>mobile</strong> layout — compact, single column</p>}
        {isTablet && <p style={{ margin: 0 }}>Showing <strong>tablet</strong> layout — side nav collapsed, reduced columns</p>}
        {!isMobile && !isTablet && <p style={{ margin: 0 }}>Showing <strong>desktop</strong> layout — full sidebar, all columns visible</p>}
      </div>
    </div>
  );
}
