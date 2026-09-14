import { pageRoutes as httpApiReferencePageRoutes } from "../modules/http-api-reference/pages.routes";

const leftNav = [
  {
    label: "HTTP API Reference",
    items: [
      { label: "Getting Started", icon: "rocket_launch", routeId: httpApiReferencePageRoutes.gettingStarted.id, exactMatch: true },
      { label: "Authentication", icon: "key", routeId: httpApiReferencePageRoutes.authentication.id },
      { label: "Audit Response", icon: "history", routeId: httpApiReferencePageRoutes.auditResponse.id },
      { label: "OpenAPI Document", icon: "article", routeId: httpApiReferencePageRoutes.openApi.id },
    ],
  },
] as const;

export default leftNav;
