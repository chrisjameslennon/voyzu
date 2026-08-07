import type { BadgeColor } from "@voyzu/ui-components";

export function getUserStatusColor(status: string | null | undefined): BadgeColor {
  return status === "ACTIVE" ? "success" : "neutral";
}
