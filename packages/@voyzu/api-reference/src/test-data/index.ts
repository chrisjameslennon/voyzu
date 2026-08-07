import createCompanyOperationDoc from "./create-company.operation-doc.json";
import filterCompaniesOperationDoc from "./filter-companies.operation-doc.json";
import listCompaniesOperationDoc from "./list-companies.operation-doc.json";
import type { ApiPageData, OperationDoc } from "../types/index";
import { operationDocToApiOperationData } from "./operation-doc-adapter";

export const companyOperationDocs: OperationDoc[] = [
  listCompaniesOperationDoc as OperationDoc,
  createCompanyOperationDoc as OperationDoc,
  filterCompaniesOperationDoc as OperationDoc,
];

export const companiesPageData: ApiPageData = {
  eyebrow: "Organization",
  title: "Companies",
  resourcePath: "/api/companies",
  description: "Company endpoints manage organization-level company records. This static first pass shows the page structure for endpoint documentation.",
  operations: companyOperationDocs.map(operationDocToApiOperationData),
};
