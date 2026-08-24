import Type from "typebox";

import { CountryResponseDto } from "@voyzu/localization/types/modules/countries";

export const events = {
  countryCreated: {
    description: "A country was created.",
    payload: CountryResponseDto,
  },
  countryUpdated: {
    description: "A country was updated.",
    payload: CountryResponseDto,
  },
  countryDeleted: {
    description: "A country was deleted.",
    payload: CountryResponseDto,
  },
  countriesCreated: {
    description: "Countries were created.",
    payload: Type.Array(CountryResponseDto),
  },
  countriesUpdated: {
    description: "Countries were updated.",
    payload: Type.Array(CountryResponseDto),
  },
  countriesDeleted: {
    description: "Countries were deleted.",
    payload: Type.Array(CountryResponseDto),
  },
  countryActivated: {
    description: "A country was activated.",
    payload: CountryResponseDto,
  },
  countryDeactivated: {
    description: "A country was deactivated.",
    payload: CountryResponseDto,
  },
  countriesActivated: {
    description: "Countries were activated.",
    payload: Type.Array(CountryResponseDto),
  },
  countriesDeactivated: {
    description: "Countries were deactivated.",
    payload: Type.Array(CountryResponseDto),
  },
} as const;
