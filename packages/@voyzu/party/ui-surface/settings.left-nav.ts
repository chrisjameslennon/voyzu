import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";
export default [{ items: { "parties.menu.parties": {
  label: "Parties", icon: "groups", routeId: "voyzu.parties.page.list",
} } }] as const satisfies readonly UiSurfaceMenuGroup[];
