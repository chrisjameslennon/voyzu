import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto } from "@voyzu/localization/types/modules/core";
import { Status } from "@voyzu/localization/types/modules/core";
import { BusinessCode, CurrencyCode, NonBlankText } from "@voyzu/localization/types/constraints";

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
