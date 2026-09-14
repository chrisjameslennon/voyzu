import { httpApiRoutes as routes0 } from "./modules/audit/http-api.routes";

export const httpApiRouting = {
  roots: ["/audit"],
  routes: { ...routes0 },
} as const;

export const httpApiDocumentation = {
  "sections": {
    "audit.platform": {
      "title": "Platform",
      "navigationHeadingId": "voyzu.platform",
      "description": "Core Voyzu platform operations.",
      "groups": {
        "audit.operations": {
          "title": "@voyzu/audit",
          "description": "Platform operations provided by @voyzu/audit.",
          "routes": {
            "audit.audit.list": {
              "description": "Lists audit events across installed packages using the supplied filters."
            },
            "audit.audit.count": {
              "description": "Counts audit events across installed packages using the supplied filters."
            },
            "audit.audit.export": {
              "description": "Exports audit events across installed packages using the supplied filters."
            },
            "audit.audit.get": {
              "description": "Gets one audit event by identifier."
            }
          }
        }
      }
    }
  }
} as const;
