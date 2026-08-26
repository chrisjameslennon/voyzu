import { pageRoutes as apiReferencePageRoutes } from "../modules/api-reference/pages.routes";

const leftNav = [
  {
    label: "API Reference",
    items: [
      { label: "Getting Started", icon: "rocket_launch", routeId: apiReferencePageRoutes.gettingStarted.id, exactMatch: true },
      { label: "Authentication", icon: "key", routeId: apiReferencePageRoutes.authentication.id },
      { label: "Audit Response", icon: "history", routeId: apiReferencePageRoutes.auditResponse.id },
      { label: "OpenAPI Document", icon: "article", routeId: apiReferencePageRoutes.openApi.id },
    ],
  },
] as const;

export default leftNav;
