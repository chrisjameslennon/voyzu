import "server-only";

import * as service from "./server/lib/currency.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const listCurrencies = operation(service.listCurrencies);
export const filterCurrencies = operation(service.filterCurrencies);
export const searchCurrencies = operation(service.searchCurrencies);
export const getCurrency = operation(service.getCurrency);
export const createCurrency = operation(service.createCurrency);
export const updateCurrency = operation(service.updateCurrency);
export const patchCurrency = operation(service.patchCurrency);
export const deleteCurrency = operation(service.deleteCurrency);
export const batchCreateCurrencies = operation(service.batchCreateCurrencies);
export const batchGetCurrencies = operation(service.batchGetCurrencies);
export const batchUpdateCurrencies = operation(service.batchUpdateCurrencies);
export const batchPatchCurrencies = operation(service.batchPatchCurrencies);
export const batchDeleteCurrencies = operation(service.batchDeleteCurrencies);
export const activateCurrency = operation(service.activateCurrency);
export const deactivateCurrency = operation(service.deactivateCurrency);
export const activateCurrencies = operation(service.activateCurrencies);
export const deactivateCurrencies = operation(service.deactivateCurrencies);

export const operations = {
  listCurrencies,
  filterCurrencies,
  searchCurrencies,
  getCurrency,
  createCurrency,
  updateCurrency,
  patchCurrency,
  deleteCurrency,
  batchCreateCurrencies,
  batchGetCurrencies,
  batchUpdateCurrencies,
  batchPatchCurrencies,
  batchDeleteCurrencies,
  activateCurrency,
  deactivateCurrency,
  activateCurrencies,
  deactivateCurrencies,
} as const;
