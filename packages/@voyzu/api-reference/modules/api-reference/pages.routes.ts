import { createElement } from "react";
import { AuditResponsePage } from "./server/pages/AuditResponsePage";
import { AuthenticationPage } from "./server/pages/AuthenticationPage";
import { GeneratedOperationsPage } from "./server/pages/GeneratedOperationsPage";
import { GettingStartedPage } from "./server/pages/GettingStartedPage";
import { OpenApiDefinitionPage } from "./server/pages/OpenApiDefinitionPage";

const auth = {
  required: true,
  minRole: "STANDARD",
} as const;

const helpPath = "api-reference/api-reference";

function GeneratedApiReferencePage(props: Record<string, unknown>) {
  const { packageFolder, moduleFolder } = props;
  if (typeof packageFolder !== "string" || typeof moduleFolder !== "string") {
    throw new Error("The generated API Reference route requires package and module folders.");
  }
  return createElement(GeneratedOperationsPage, {
    packageFolder: decodeURIComponent(packageFolder),
    moduleFolder: decodeURIComponent(moduleFolder),
  });
}

export const pageRoutes = {
  gettingStarted: {
    id: "voyzu.api-reference.page.getting-started",
    path: "/api-reference",
    pageTitle: "API Reference",
    Page: GettingStartedPage,
    helpPath,
    auth,
  },
  authentication: {
    id: "voyzu.api-reference.page.authentication",
    path: "/api-reference/authentication",
    pageTitle: "API Authentication",
    Page: AuthenticationPage,
    helpPath,
    auth,
  },
  auditResponse: {
    id: "voyzu.api-reference.page.audit-response",
    path: "/api-reference/models/audit-response",
    pageTitle: "Audit Response",
    Page: AuditResponsePage,
    helpPath,
    auth,
  },
  openApi: {
    id: "voyzu.api-reference.page.openapi",
    path: "/api-reference/openapi",
    pageTitle: "OpenAPI Definition",
    Page: OpenApiDefinitionPage,
    helpPath,
    auth,
  },
  generated: {
    id: "voyzu.api-reference.page.generated",
    path: "/api-reference/[packageFolder]/[moduleFolder]",
    pageTitle: "API Reference",
    Page: GeneratedApiReferencePage,
    helpPath,
    auth,
  },
} as const;
