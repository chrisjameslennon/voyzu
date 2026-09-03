import "server-only";

import { command } from "@voyzu/capability/commands";
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

export const createCountry = command.defineLazy(
  { parameters: Type.Tuple([CountryCreateRequestDto]), result: CountryResponseDto },
  () => loadService().then((module) => module.createCountry),
);
export const getCountry = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String()]),
    result: Type.Union([CountryResponseDto, Type.Null()]),
  },
  () => loadService().then((module) => module.getCountry),
);
export const updateCountry = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CountryUpdateRequestDto]),
    result: CountryResponseDto,
  },
  () => loadService().then((module) => module.updateCountry),
);
export const patchCountry = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), CountryPatchRequestDto]),
    result: CountryResponseDto,
  },
  () => loadService().then((module) => module.patchCountry),
);
export const deleteCountry = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: Type.Undefined() },
  () => loadService().then((module) => module.deleteCountry),
);
export const listCountries = command.defineLazy(
  { parameters: Type.Tuple([]), result: CountryList },
  () => loadService().then((module) => module.listCountries),
);
export const filterCountries = command.defineLazy(
  { parameters: optionalListOptions(Type.Array(Filter)), result: CountryList },
  () => loadService().then((module) => module.filterCountries),
);
export const searchCountries = command.defineLazy(
  { parameters: optionalListOptions(Type.String()), result: CountryList },
  () => loadService().then((module) => module.searchCountries),
);
export const batchCreateCountries = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(CountryCreateRequestDto)]), result: CountryList },
  () => loadService().then((module) => module.batchCreateCountries),
);
export const batchGetCountries = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CountryList },
  () => loadService().then((module) => module.batchGetCountries),
);
export const batchUpdateCountries = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(CountryBatchUpdateRequestDto)]), result: CountryList },
  () => loadService().then((module) => module.batchUpdateCountries),
);
export const batchPatchCountries = command.defineLazy(
  { parameters: Type.Tuple([Type.Array(CountryBatchPatchRequestDto)]), result: CountryList },
  () => loadService().then((module) => module.batchPatchCountries),
);
export const batchDeleteCountries = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: Type.Undefined() },
  () => loadService().then((module) => module.batchDeleteCountries),
);
export const activateCountry = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CountryResponseDto },
  () => loadService().then((module) => module.activateCountry),
);
export const deactivateCountry = command.defineLazy(
  { parameters: Type.Tuple([Type.String()]), result: CountryResponseDto },
  () => loadService().then((module) => module.deactivateCountry),
);
export const activateCountries = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CountryList },
  () => loadService().then((module) => module.activateCountries),
);
export const deactivateCountries = command.defineLazy(
  { parameters: Type.Tuple([Codes]), result: CountryList },
  () => loadService().then((module) => module.deactivateCountries),
);

export const commands = {
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
