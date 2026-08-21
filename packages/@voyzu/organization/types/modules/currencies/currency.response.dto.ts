import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto, OperationReference } from "@voyzu/organization/types/modules/core";
import { Status } from "@voyzu/organization/types/modules/core";
import { BusinessCode, NonBlankText } from "@voyzu/organization/types/constraints";

export const CurrencyResponseDto = StrictObject({
  id: Type.String({ description: "Stable currency identifier." }),
  code: BusinessCode,
  name: NonBlankText,
  symbol: Type.Optional(Type.String()),
  status: Status,
  hasPostings: Type.Boolean({ description: "True when at least one company using this base currency has posted journal headers." }),
  linkedBy: Type.Array(OperationReference),
  audit: AuditMetadataDto,
});
export type CurrencyResponseDto = Type.Static<typeof CurrencyResponseDto>;
