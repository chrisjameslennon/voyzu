import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "items": {
      "organization.menu1.organizations": {
        "label": "Organizations",
        "icon": "domain",
        "routeId": "voyzu.organizations.page.list"
      }
    }
  },
  {
    "label": "Reports",
    "items": {
      "organization.menu2.lists": {
        "label": "Lists",
        "icon": "format_list_bulleted",
        "children": {
          "organization.menu2.lists.organizations": {
            "label": "Organizations",
            "routeId": "voyzu.organizationReports.page.organizations"
          },
          "organization.menu2.lists.countries": {
            "label": "Countries",
            "routeId": "voyzu.organizationReports.page.countries"
          },
          "organization.menu2.lists.currencies": {
            "label": "Currencies",
            "routeId": "voyzu.organizationReports.page.currencies"
          }
        }
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
