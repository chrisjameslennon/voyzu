import "server-only";

import * as service0 from "./server/lib/currency.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const listCurrencies = operation(service0.listCurrencies);
export const filterCurrencies = operation(service0.filterCurrencies);
export const searchCurrencies = operation(service0.searchCurrencies);
export const getCurrency = operation(service0.getCurrency);
export const createCurrency = operation(service0.createCurrency);
export const updateCurrency = operation(service0.updateCurrency);
export const patchCurrency = operation(service0.patchCurrency);
export const deleteCurrency = operation(service0.deleteCurrency);
export const batchCreateCurrencies = operation(service0.batchCreateCurrencies);
export const batchGetCurrencies = operation(service0.batchGetCurrencies);
export const batchUpdateCurrencies = operation(service0.batchUpdateCurrencies);
export const batchPatchCurrencies = operation(service0.batchPatchCurrencies);
export const batchDeleteCurrencies = operation(service0.batchDeleteCurrencies);
export const activateCurrency = operation(service0.activateCurrency);
export const deactivateCurrency = operation(service0.deactivateCurrency);
export const activateCurrencies = operation(service0.activateCurrencies);
export const deactivateCurrencies = operation(service0.deactivateCurrencies);

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
