const auth = {
  required: true,
  minRole: "STANDARD",
} as const;

const helpPath = "api-reference/api-reference";

export const pageRoutes = {
  gettingStarted: {
    id: "voyzu.api-reference.page.getting-started",
    path: "/api-reference",
    pageTitle: "API Reference",
    loadPage: () =>
      import("./server/pages/GettingStartedPage")
        .then((module) => module.GettingStartedPage),
    helpPath,
    auth,
  },
  authentication: {
    id: "voyzu.api-reference.page.authentication",
    path: "/api-reference/authentication",
    pageTitle: "API Authentication",
    loadPage: () =>
      import("./server/pages/AuthenticationPage")
        .then((module) => module.AuthenticationPage),
    helpPath,
    auth,
  },
  auditResponse: {
    id: "voyzu.api-reference.page.audit-response",
    path: "/api-reference/models/audit-response",
    pageTitle: "Audit Response",
    loadPage: () =>
      import("./server/pages/AuditResponsePage")
        .then((module) => module.AuditResponsePage),
    helpPath,
    auth,
  },
  openApi: {
    id: "voyzu.api-reference.page.openapi",
    path: "/api-reference/openapi",
    pageTitle: "OpenAPI Definition",
    loadPage: () =>
      import("./server/pages/OpenApiDefinitionPage")
        .then((module) => module.OpenApiDefinitionPage),
    helpPath,
    auth,
  },
  generated: {
    id: "voyzu.api-reference.page.generated",
    path: "/api-reference/[packageFolder]/[moduleFolder]",
    pageTitle: "API Reference",
    loadPage: () =>
      import("./server/pages/GeneratedApiReferencePage")
        .then((module) => module.GeneratedApiReferencePage),
    helpPath,
    auth,
  },
} as const;
