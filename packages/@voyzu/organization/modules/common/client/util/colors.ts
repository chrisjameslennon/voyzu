import type { AccountType } from "@voyzu/organization/types/modules/core";
import { getRandomDeterministicColor, type AvatarColor } from "@voyzu/ui-style";
import type { BadgeColor, BadgeCustomColors } from "@voyzu/ui-components";

export function getAvatarColor(seed: string): AvatarColor {
  return getRandomDeterministicColor(seed);
}

export function getHasPostingsColor(hasPostings: boolean): BadgeCustomColors {
  const color = getRandomDeterministicColor(hasPostings ? "HAS_POSTINGS_YES" : "HAS_POSTINGS_NO");
  return { ...color, border: color.bg };
}

export function getStatusSemanticColor(status: string | null | undefined): BadgeColor {
  switch (status) {
    case "ACTIVE":
    case "OPEN":
    case "POSTED":
      return "success";
    case "PLANNED":
    case "DRAFT":
      return "info";
    case "REVERSED":
    case "VOID":
    case "DELETED":
    case "FAILED":
    case "ERROR":
      return "danger";
    default:
      return "neutral";
  }
}

export type GlAccountTypeColorCode = AccountType;

const glAccountTypeColors: Record<GlAccountTypeColorCode, BadgeCustomColors> = {
  ASSET: { fg: "#134e4a", bg: "#ccfbf1", border: "#99f6e4" },
  LIABILITY: { fg: "#1e3a8a", bg: "#dbeafe", border: "#bfdbfe" },
  EQUITY: { fg: "#92400e", bg: "#fef3c7", border: "#fde68a" },
  REVENUE: { fg: "#166534", bg: "#dcfce7", border: "#bbf7d0" },
  EXPENSE: { fg: "#7c2d12", bg: "#fee2e2", border: "#fecaca" },
};

export function getGlAccountTypeColor(code: string | null | undefined): BadgeCustomColors {
  return glAccountTypeColors[code as GlAccountTypeColorCode] ?? {
    fg: "var(--voyzu-color-neutral-text)",
    bg: "var(--voyzu-color-neutral-bg)",
    border: "var(--voyzu-color-neutral-border)",
  };
}

export function getDrCrColor(value: string | null | undefined): BadgeColor {
  if (value === "DR" || value === "DEBIT") return "danger";
  if (value === "CR" || value === "CREDIT") return "success";
  return "neutral";
}

export function getAuditActionColor(action: string | null | undefined): BadgeColor {
  switch (action) {
    case "INSERT":
      return "success";
    case "UPDATE":
      return "info";
    case "DELETE":
      return "danger";
    default:
      return "neutral";
  }
}
