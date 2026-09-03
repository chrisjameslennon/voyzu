import "server-only";

import { command } from "@voyzu/capability/commands";
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

export const listCurrencies = command.defineLazy(
  { parameters: Type.Tuple([]), result: CurrencyList },
  () => loadService().then((module) => module.listCurrencies),
);
export const filterCurrencies = command.defineLazy(
  { parameters: optionalListOptions(Type.Array(Filter)), result: CurrencyList },
  () => loadService().then((module) => module.filterCurrencies),
);
export const searchCurrencies = command.defineLazy(
  { parameters: optionalListOptions(Type.String()), result: CurrencyList },
  () => loadService().then((module) => module.searchCurrencies),
);
export const getCurrency = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String()]),
    result: Type.Union([CurrencyResponseDto, Type.Null()]),
  },
  () => loadService().then((module) => module.getCurrency),
);
export const createCurrency = command.defineLazy(
  { parameters: Type.Tuple([CurrencyCreateRequestDto]), result: CurrencyResponseDto },
  () => loadService().then((module) => module.createCurrency),
);
export const updateCurrency = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CurrencyUpdateRequestDto]),
    result: CurrencyResponseDto,
  },
  () => loadService().then((module) => module.updateCurrency),
);
export const patchCurrency = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CurrencyPatchRequestDto]),
    result: CurrencyResponseDto,
  },
  () => loadService().then((module) => module.patchCurrency),
);
export const deleteCurrency = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: Type.Undefined() },
  () => loadService().then((module) => module.deleteCurrency),
);
export const batchCreateCurrencies = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(CurrencyCreateRequestDto)]), result: CurrencyList },
  () => loadService().then((module) => module.batchCreateCurrencies),
);
export const batchGetCurrencies = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CurrencyList },
  () => loadService().then((module) => module.batchGetCurrencies),
);
export const batchUpdateCurrencies = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(CurrencyBatchUpdateRequestDto)]), result: CurrencyList },
  () => loadService().then((module) => module.batchUpdateCurrencies),
);
export const batchPatchCurrencies = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(CurrencyBatchPatchRequestDto)]), result: CurrencyList },
  () => loadService().then((module) => module.batchPatchCurrencies),
);
export const batchDeleteCurrencies = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: Type.Undefined() },
  () => loadService().then((module) => module.batchDeleteCurrencies),
);
export const activateCurrency = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CurrencyResponseDto },
  () => loadService().then((module) => module.activateCurrency),
);
export const deactivateCurrency = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CurrencyResponseDto },
  () => loadService().then((module) => module.deactivateCurrency),
);
export const activateCurrencies = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CurrencyList },
  () => loadService().then((module) => module.activateCurrencies),
);
export const deactivateCurrencies = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CurrencyList },
  () => loadService().then((module) => module.deactivateCurrencies),
);

export const commands = {
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
