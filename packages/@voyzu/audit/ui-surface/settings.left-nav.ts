import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "items": {
      "audit.menu1.audit-log": {
        "label": "Audit Log",
        "icon": "history",
        "routeId": "voyzu.audit.page.list"
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
