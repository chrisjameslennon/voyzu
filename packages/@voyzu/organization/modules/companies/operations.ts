import "server-only";

import * as service0 from "./server/lib/company.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const createCompany = operation(service0.createCompany);
export const getCompany = operation(service0.getCompany);
export const updateCompany = operation(service0.updateCompany);
export const patchCompany = operation(service0.patchCompany);
export const deleteCompany = operation(service0.deleteCompany);
export const listCompanies = operation(service0.listCompanies);
export const filterCompanies = operation(service0.filterCompanies);
export const searchCompanies = operation(service0.searchCompanies);
export const batchCreateCompanies = operation(service0.batchCreateCompanies);
export const batchGetCompanies = operation(service0.batchGetCompanies);
export const batchUpdateCompanies = operation(service0.batchUpdateCompanies);
export const batchPatchCompanies = operation(service0.batchPatchCompanies);
export const batchDeleteCompanies = operation(service0.batchDeleteCompanies);
export const activateCompanies = operation(service0.activateCompanies);
export const deactivateCompanies = operation(service0.deactivateCompanies);
export const activateCompany = operation(service0.activateCompany);
export const deactivateCompany = operation(service0.deactivateCompany);

export const operations = {
  createCompany,
  getCompany,
  updateCompany,
  patchCompany,
  deleteCompany,
  listCompanies,
  filterCompanies,
  searchCompanies,
  batchCreateCompanies,
  batchGetCompanies,
  batchUpdateCompanies,
  batchPatchCompanies,
  batchDeleteCompanies,
  activateCompanies,
  deactivateCompanies,
  activateCompany,
  deactivateCompany,
} as const;
