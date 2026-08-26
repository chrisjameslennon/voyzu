import "server-only";

import { operation } from "@voyzu/capability/operations";
import {
  CurrencyBatchPatchRequestDto,
  CurrencyBatchUpdateRequestDto,
  CurrencyCreateRequestDto,
  CurrencyPatchRequestDto,
  CurrencyResponseDto,
  CurrencyUpdateRequestDto,
} from "@voyzu/localization/types/modules/currencies";
import { Filter, ListOptions } from "@voyzu/types";
import Type, { type TSchema } from "typebox";

const CurrencyList = Type.Array(CurrencyResponseDto);
const Codes = Type.Array(Type.String());
const optionalListOptions = (first: TSchema) =>
  Type.Union([Type.Tuple([first]), Type.Tuple([first, ListOptions])]);
const loadService = () => import("./server/lib/currency.service");

export const listCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([]), result: CurrencyList },
  () => loadService().then((module) => module.listCurrencies),
);
export const filterCurrencies = operation.defineLazy(
  { parameters: optionalListOptions(Type.Array(Filter)), result: CurrencyList },
  () => loadService().then((module) => module.filterCurrencies),
);
export const searchCurrencies = operation.defineLazy(
  { parameters: optionalListOptions(Type.String()), result: CurrencyList },
  () => loadService().then((module) => module.searchCurrencies),
);
export const getCurrency = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String()]),
    result: Type.Union([CurrencyResponseDto, Type.Null()]),
  },
  () => loadService().then((module) => module.getCurrency),
);
export const createCurrency = operation.defineLazy(
  { parameters: Type.Tuple([CurrencyCreateRequestDto]), result: CurrencyResponseDto },
  () => loadService().then((module) => module.createCurrency),
);
export const updateCurrency = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CurrencyUpdateRequestDto]),
    result: CurrencyResponseDto,
  },
  () => loadService().then((module) => module.updateCurrency),
);
export const patchCurrency = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CurrencyPatchRequestDto]),
    result: CurrencyResponseDto,
  },
  () => loadService().then((module) => module.patchCurrency),
);
export const deleteCurrency = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: Type.Undefined() },
  () => loadService().then((module) => module.deleteCurrency),
);
export const batchCreateCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(CurrencyCreateRequestDto)]), result: CurrencyList },
  () => loadService().then((module) => module.batchCreateCurrencies),
);
export const batchGetCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CurrencyList },
  () => loadService().then((module) => module.batchGetCurrencies),
);
export const batchUpdateCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(CurrencyBatchUpdateRequestDto)]), result: CurrencyList },
  () => loadService().then((module) => module.batchUpdateCurrencies),
);
export const batchPatchCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(CurrencyBatchPatchRequestDto)]), result: CurrencyList },
  () => loadService().then((module) => module.batchPatchCurrencies),
);
export const batchDeleteCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: Type.Undefined() },
  () => loadService().then((module) => module.batchDeleteCurrencies),
);
export const activateCurrency = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CurrencyResponseDto },
  () => loadService().then((module) => module.activateCurrency),
);
export const deactivateCurrency = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CurrencyResponseDto },
  () => loadService().then((module) => module.deactivateCurrency),
);
export const activateCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CurrencyList },
  () => loadService().then((module) => module.activateCurrencies),
);
export const deactivateCurrencies = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CurrencyList },
  () => loadService().then((module) => module.deactivateCurrencies),
);

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
