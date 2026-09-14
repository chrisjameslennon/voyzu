import Type from "typebox";
import { CountrySchema } from "@voyzu/types/dtos/country";
import { CountryFinanceSchema } from "./country-finance.internal-api.dto";

export const CountryWithFinanceSchema = Type.Object({ ...CountrySchema.properties, finance: CountryFinanceSchema }, { additionalProperties: false });

export const CountryWithFinanceGetRequestDto = Type.Object({ code: Type.String({ pattern: "^[A-Z]{2}$" }) }, { additionalProperties: false });

export const CountryWithFinanceGetResponseDto = Type.Union([CountryWithFinanceSchema, Type.Null()]);
