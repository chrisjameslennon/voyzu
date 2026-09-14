import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "label": "Settings",
    "items": {
      "auth.menu1.users": {
        "label": "Users",
        "icon": "person",
        "routeId": "voyzu.users.page.list"
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
