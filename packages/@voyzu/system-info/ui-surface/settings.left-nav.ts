import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "label": "Settings",
    "items": {
      "system-info.menu1.system-information": {
        "label": "System Information",
        "icon": "info",
        "routeId": "voyzu.system-info.page.home"
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
