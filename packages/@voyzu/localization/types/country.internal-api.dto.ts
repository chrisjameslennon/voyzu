import Type from "typebox";
import { CountryResponseDto } from "./modules/countries/country.response.dto";

export const CountrySchema = CountryResponseDto;

export const CountryGetRequestDto = Type.Object({ code: CountrySchema.properties.code }, { additionalProperties: false });

export const CountryGetResponseDto = Type.Union([CountrySchema, Type.Null()]);

export const CountryListRequestDto = Type.Object({  }, { additionalProperties: false });

export const CountryListResponseDto = Type.Array(CountrySchema);
