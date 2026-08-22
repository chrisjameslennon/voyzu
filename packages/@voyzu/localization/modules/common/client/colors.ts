import { getRandomDeterministicColor } from "@voyzu/ui-style";
import type { BadgeColor, BadgeCustomColors } from "@voyzu/ui-components";

export function getHasPostingsColor(hasPostings: boolean): BadgeCustomColors {
  const color = getRandomDeterministicColor(hasPostings ? "HAS_POSTINGS_YES" : "HAS_POSTINGS_NO");
  return { ...color, border: color.bg };
}

export function getStatusSemanticColor(status: string | null | undefined): BadgeColor {
  return status === "ACTIVE" ? "success" : "neutral";
}
