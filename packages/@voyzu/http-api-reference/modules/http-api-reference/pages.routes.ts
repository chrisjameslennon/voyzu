const auth = {
  required: true,
  minRole: "STANDARD",
} as const;

const helpPath = "http-api-reference/http-api-reference";

export const pageRoutes = {
  "voyzu.http-api-reference.page.getting-started": {
    path: "/http-api-reference",
    pageTitle: "HTTP API Reference",
    loadPage: () =>
      import("./server/pages/GettingStartedPage")
        .then((module) => module.GettingStartedPage),
    helpPath,
    auth,
  },
  "voyzu.http-api-reference.page.authentication": {
    path: "/http-api-reference/authentication",
    pageTitle: "HTTP API Authentication",
    loadPage: () =>
      import("./server/pages/AuthenticationPage")
        .then((module) => module.AuthenticationPage),
    helpPath,
    auth,
  },
  "voyzu.http-api-reference.page.audit-response": {
    path: "/http-api-reference/models/audit-response",
    pageTitle: "Audit Response",
    loadPage: () =>
      import("./server/pages/AuditResponsePage")
        .then((module) => module.AuditResponsePage),
    helpPath,
    auth,
  },
  "voyzu.http-api-reference.page.openapi": {
    path: "/http-api-reference/openapi",
    pageTitle: "OpenAPI Definition",
    loadPage: () =>
      import("./server/pages/OpenApiDefinitionPage")
        .then((module) => module.OpenApiDefinitionPage),
    helpPath,
    auth,
  },
  "voyzu.http-api-reference.page.generated": {
    pathParams: { packageFolder: { type: "string" }, groupFolder: { type: "string" } },
    path: "/http-api-reference/[packageFolder]/[groupFolder]",
    pageTitle: "HTTP API Reference",
    loadPage: () =>
      import("./server/pages/GeneratedHttpApiReferencePage")
        .then((module) => module.GeneratedHttpApiReferencePage),
    helpPath,
    auth,
  },
} as const;
