import "server-only";

import * as service from "./server/lib/country.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const createCountry = operation(service.createCountry);
export const getCountry = operation(service.getCountry);
export const updateCountry = operation(service.updateCountry);
export const patchCountry = operation(service.patchCountry);
export const deleteCountry = operation(service.deleteCountry);
export const listCountries = operation(service.listCountries);
export const filterCountries = operation(service.filterCountries);
export const searchCountries = operation(service.searchCountries);
export const batchCreateCountries = operation(service.batchCreateCountries);
export const batchGetCountries = operation(service.batchGetCountries);
export const batchUpdateCountries = operation(service.batchUpdateCountries);
export const batchPatchCountries = operation(service.batchPatchCountries);
export const batchDeleteCountries = operation(service.batchDeleteCountries);
export const activateCountry = operation(service.activateCountry);
export const deactivateCountry = operation(service.deactivateCountry);
export const activateCountries = operation(service.activateCountries);
export const deactivateCountries = operation(service.deactivateCountries);

export const operations = {
  createCountry,
  getCountry,
  updateCountry,
  patchCountry,
  deleteCountry,
  listCountries,
  filterCountries,
  searchCountries,
  batchCreateCountries,
  batchGetCountries,
  batchUpdateCountries,
  batchPatchCountries,
  batchDeleteCountries,
  activateCountry,
  deactivateCountry,
  activateCountries,
  deactivateCountries,
} as const;
