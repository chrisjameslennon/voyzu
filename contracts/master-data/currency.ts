import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto, Status } from "@voyzu/types/modules/core";

/** Platform-owned shape preserving the existing currency DTO, including audit metadata. */
export const CurrencyMasterData = StrictObject({
  id: Type.String({ description: "Stable currency identifier." }),
  code: Type.String({ pattern: "^[A-Z0-9][A-Z0-9_-]*$" }),
  name: Type.String({ pattern: "\\S" }),
  symbol: Type.Optional(Type.String()),
  status: Status,
  audit: AuditMetadataDto,
});
