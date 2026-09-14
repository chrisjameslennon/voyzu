import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "label": "Settings",
    "items": {
      "package-management.menu1.installed-packages": {
        "label": "Installed Packages",
        "icon": "deployed_code",
        "routeId": "voyzu.package-management.page.list"
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
