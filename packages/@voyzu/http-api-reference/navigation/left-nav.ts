const leftNav = [
  {
    label: "HTTP API Reference",
    items: [
      { label: "Getting Started", icon: "rocket_launch", routeId: "voyzu.http-api-reference.page.getting-started", exactMatch: true },
      { label: "Authentication", icon: "key", routeId: "voyzu.http-api-reference.page.authentication" },
      { label: "Audit Response", icon: "history", routeId: "voyzu.http-api-reference.page.audit-response" },
      { label: "OpenAPI Document", icon: "article", routeId: "voyzu.http-api-reference.page.openapi" },
    ],
  },
] as const;

export default leftNav;
