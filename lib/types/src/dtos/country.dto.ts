import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto, Status } from "@voyzu/types/modules/core";
import { BusinessCode, CurrencyCode, NonBlankText } from "./constraints";

export const CountryResponseDto = StrictObject({
  id: Type.String({ description: "Stable country identifier." }),
  code: BusinessCode,
  name: NonBlankText,
  currencyCode: CurrencyCode,
  currency: StrictObject({
    code: BusinessCode,
    name: NonBlankText,
  }),
  status: Status,
  audit: AuditMetadataDto,
});
export type CountryResponseDto = Type.Static<typeof CountryResponseDto>;

export const CountrySchema = CountryResponseDto;

export const CountryGetRequestDto = Type.Object({ code: CountrySchema.properties.code }, { additionalProperties: false });
export const CountryGetResponseDto = Type.Union([CountrySchema, Type.Null()]);
