import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditMetadataDto, Status } from "@voyzu/types/modules/core";

const BusinessCode = Type.String({ pattern: "^[A-Z0-9][A-Z0-9_-]*$" });
const NonBlankText = Type.String({ pattern: "\\S" });

/** Platform-owned country shape; independent of the implementing package. */
export const CountryMasterData = StrictObject({
  id: Type.String({ description: "Stable country identifier." }),
  code: BusinessCode,
  name: NonBlankText,
  currencyCode: Type.String({ pattern: "^[A-Z]{3}$" }),
  currency: StrictObject({ code: BusinessCode, name: NonBlankText }),
  status: Status,
  audit: AuditMetadataDto,
});
