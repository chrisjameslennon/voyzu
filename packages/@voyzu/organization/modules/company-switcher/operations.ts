import "server-only";

import * as service0 from "./server/company-selection.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const filterSelectableCompanies = operation(service0.filterSelectableCompanies);
export const filterAccessibleCompanies = operation(service0.filterAccessibleCompanies);
export const resolveCompanySelection = operation(service0.resolveCompanySelection);
export const listSelectableCompaniesForCurrentUser = operation(service0.listSelectableCompaniesForCurrentUser);
export const listAccessibleCompaniesForCurrentUser = operation(service0.listAccessibleCompaniesForCurrentUser);
export const resolveCompanySelectionForCurrentUser = operation(service0.resolveCompanySelectionForCurrentUser);

export const operations = {
  filterSelectableCompanies,
  filterAccessibleCompanies,
  resolveCompanySelection,
  listSelectableCompaniesForCurrentUser,
  listAccessibleCompaniesForCurrentUser,
  resolveCompanySelectionForCurrentUser,
} as const;
