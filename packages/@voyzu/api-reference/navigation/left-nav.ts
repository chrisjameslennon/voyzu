import { apiReferenceModule } from "../modules/api-reference/module";
import {
  operationAnchor,
  readGeneratedApiPackages,
} from "../modules/api-reference/server/generated-docs";

const leftNav = [
  {
    label: "API Reference",
    items: [
      { label: "Getting Started", icon: "rocket_launch", routeId: apiReferenceModule.pageRoutes.gettingStarted.id, exactMatch: true },
      { label: "Authentication", icon: "key", routeId: apiReferenceModule.pageRoutes.authentication.id },
      { label: "Audit Response", icon: "history", routeId: apiReferenceModule.pageRoutes.auditResponse.id },
      { label: "OpenAPI Document", icon: "article", routeId: apiReferenceModule.pageRoutes.openApi.id },
    ],
  },
  ...readGeneratedApiPackages().map((packageDefinition) => ({
    label: packageDefinition.packageName,
    items: packageDefinition.modules.map((moduleDefinition) => ({
      label: moduleDefinition.label,
      icon: "article",
      path: moduleDefinition.path,
      children: moduleDefinition.operations.map((operation) => ({
        label: operation.summary,
        path: `${moduleDefinition.path}#${operationAnchor(operation.summary)}`,
      })),
    })),
  })),
] as const;

export default leftNav;
