import "server-only";

import * as service0 from "./server/lib/country.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const createCountry = operation(service0.createCountry);
export const getCountry = operation(service0.getCountry);
export const updateCountry = operation(service0.updateCountry);
export const patchCountry = operation(service0.patchCountry);
export const deleteCountry = operation(service0.deleteCountry);
export const listCountries = operation(service0.listCountries);
export const listCountriesWithTaxConfiguration = operation(service0.listCountriesWithTaxConfiguration);
export const filterCountries = operation(service0.filterCountries);
export const searchCountries = operation(service0.searchCountries);
export const batchCreateCountries = operation(service0.batchCreateCountries);
export const batchGetCountries = operation(service0.batchGetCountries);
export const batchUpdateCountries = operation(service0.batchUpdateCountries);
export const batchPatchCountries = operation(service0.batchPatchCountries);
export const batchDeleteCountries = operation(service0.batchDeleteCountries);
export const activateCountry = operation(service0.activateCountry);
export const deactivateCountry = operation(service0.deactivateCountry);
export const activateCountries = operation(service0.activateCountries);
export const deactivateCountries = operation(service0.deactivateCountries);

export const operations = {
  createCountry,
  getCountry,
  updateCountry,
  patchCountry,
  deleteCountry,
  listCountries,
  listCountriesWithTaxConfiguration,
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
