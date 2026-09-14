import type { UiSurfaceMenuGroup } from "@voyzu/types/ui-surface";

export default [
  {
    "label": "HTTP API Reference",
    "items": {
      "http-api-reference.menu1.getting-started": {
        "label": "Getting Started",
        "icon": "rocket_launch",
        "routeId": "voyzu.http-api-reference.page.getting-started",
        "exactMatch": true
      },
      "http-api-reference.menu1.authentication": {
        "label": "Authentication",
        "icon": "key",
        "routeId": "voyzu.http-api-reference.page.authentication"
      },
      "http-api-reference.menu1.audit-response": {
        "label": "Audit Response",
        "icon": "history",
        "routeId": "voyzu.http-api-reference.page.audit-response"
      },
      "http-api-reference.menu1.openapi-document": {
        "label": "OpenAPI Document",
        "icon": "article",
        "routeId": "voyzu.http-api-reference.page.openapi"
      }
    }
  }
] as const satisfies readonly UiSurfaceMenuGroup[];
