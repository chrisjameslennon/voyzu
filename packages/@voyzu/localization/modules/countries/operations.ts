import "server-only";

import { operation } from "@voyzu/capability/operations";
import {
  CountryBatchPatchRequestDto,
  CountryBatchUpdateRequestDto,
  CountryCreateRequestDto,
  CountryPatchRequestDto,
  CountryResponseDto,
  CountryUpdateRequestDto,
} from "@voyzu/localization/types/modules/countries";
import { Filter, ListOptions } from "@voyzu/types";
import Type, { type TSchema } from "typebox";

const CountryList = Type.Array(CountryResponseDto);
const Codes = Type.Array(Type.String());
const optionalListOptions = (first: TSchema) =>
  Type.Union([Type.Tuple([first]), Type.Tuple([first, ListOptions])]);
const loadService = () => import("./server/lib/country.service");

export const createCountry = operation.defineLazy(
  { parameters: Type.Tuple([CountryCreateRequestDto]), result: CountryResponseDto },
  () => loadService().then((module) => module.createCountry),
);
export const getCountry = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String()]),
    result: Type.Union([CountryResponseDto, Type.Null()]),
  },
  () => loadService().then((module) => module.getCountry),
);
export const updateCountry = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CountryUpdateRequestDto]),
    result: CountryResponseDto,
  },
  () => loadService().then((module) => module.updateCountry),
);
export const patchCountry = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CountryPatchRequestDto]),
    result: CountryResponseDto,
  },
  () => loadService().then((module) => module.patchCountry),
);
export const deleteCountry = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: Type.Undefined() },
  () => loadService().then((module) => module.deleteCountry),
);
export const listCountries = operation.defineLazy(
  { parameters: Type.Tuple([]), result: CountryList },
  () => loadService().then((module) => module.listCountries),
);
export const filterCountries = operation.defineLazy(
  { parameters: optionalListOptions(Type.Array(Filter)), result: CountryList },
  () => loadService().then((module) => module.filterCountries),
);
export const searchCountries = operation.defineLazy(
  { parameters: optionalListOptions(Type.String()), result: CountryList },
  () => loadService().then((module) => module.searchCountries),
);
export const batchCreateCountries = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(CountryCreateRequestDto)]), result: CountryList },
  () => loadService().then((module) => module.batchCreateCountries),
);
export const batchGetCountries = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CountryList },
  () => loadService().then((module) => module.batchGetCountries),
);
export const batchUpdateCountries = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(CountryBatchUpdateRequestDto)]), result: CountryList },
  () => loadService().then((module) => module.batchUpdateCountries),
);
export const batchPatchCountries = operation.defineLazy(
  { parameters: Type.Tuple([Type.Array(CountryBatchPatchRequestDto)]), result: CountryList },
  () => loadService().then((module) => module.batchPatchCountries),
);
export const batchDeleteCountries = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: Type.Undefined() },
  () => loadService().then((module) => module.batchDeleteCountries),
);
export const activateCountry = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CountryResponseDto },
  () => loadService().then((module) => module.activateCountry),
);
export const deactivateCountry = operation.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CountryResponseDto },
  () => loadService().then((module) => module.deactivateCountry),
);
export const activateCountries = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CountryList },
  () => loadService().then((module) => module.activateCountries),
);
export const deactivateCountries = operation.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CountryList },
  () => loadService().then((module) => module.deactivateCountries),
);

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
