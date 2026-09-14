import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "items": {
      "localization.menu1.localization": {
        "label": "Localization",
        "icon": "globe",
        "children": {
          "localization.menu1.localization.countries": {
            "label": "Countries",
            "routeId": "voyzu.countries.page.list"
          },
          "localization.menu1.localization.currencies": {
            "label": "Currencies",
            "routeId": "voyzu.currencies.page.list"
          }
        }
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
