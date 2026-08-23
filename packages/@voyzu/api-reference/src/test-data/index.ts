import createOrganizationOperationDoc from "./create-organization.operation-doc.json";
import filterOrganizationsOperationDoc from "./filter-organizations.operation-doc.json";
import listOrganizationsOperationDoc from "./list-organizations.operation-doc.json";
import type { ApiPageData, OperationDoc } from "../types/index";
import { operationDocToApiOperationData } from "./operation-doc-adapter";

export const organizationOperationDocs: OperationDoc[] = [
  listOrganizationsOperationDoc as OperationDoc,
  createOrganizationOperationDoc as OperationDoc,
  filterOrganizationsOperationDoc as OperationDoc,
];

export const organizationsPageData: ApiPageData = {
  eyebrow: "Organization",
  title: "Organizations",
  resourcePath: "/api/organizations",
  description: "Organization endpoints manage organization-level organization records. This static first pass shows the page structure for endpoint documentation.",
  operations: organizationOperationDocs.map(operationDocToApiOperationData),
};
