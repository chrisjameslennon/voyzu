import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto } from "@voyzu/localization/types/modules/core";
import { Status } from "@voyzu/localization/types/modules/core";
import { BusinessCode, NonBlankText } from "@voyzu/localization/types/constraints";

export const CurrencyResponseDto = StrictObject({
  id: Type.String({ description: "Stable currency identifier." }),
  code: BusinessCode,
  name: NonBlankText,
  symbol: Type.Optional(Type.String()),
  status: Status,
  audit: AuditMetadataDto,
});
export type CurrencyResponseDto = Type.Static<typeof CurrencyResponseDto>;
