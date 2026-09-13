import Type from "typebox";
import { CurrencyResponseDto } from "./modules/currencies/currency.response.dto";

export const CurrencySchema = CurrencyResponseDto;

export const CurrencyGetRequestDto = Type.Object({ code: CurrencySchema.properties.code }, { additionalProperties: false });

export const CurrencyGetResponseDto = Type.Union([CurrencySchema, Type.Null()]);

export const CurrencyListRequestDto = Type.Object({  }, { additionalProperties: false });

export const CurrencyListResponseDto = Type.Array(CurrencySchema);
