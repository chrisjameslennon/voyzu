import Type from "typebox";
import { CurrencyResponseDto } from "./modules/currencies/currency.response.dto";

export const CurrencySchema = CurrencyResponseDto;

export const CurrencyGetRequestDto = Type.Object({ code: CurrencySchema.properties.code }, { additionalProperties: false });

export const CurrencyGetResponseDto = Type.Union([CurrencySchema, Type.Null()]);

