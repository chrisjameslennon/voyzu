import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
export const AuditEventCountResponseDto = StrictObject({
  count: Type.Integer({ minimum: 0, description: "Number of audit events matching the supplied filters." }),
});
export type AuditEventCountResponseDto = Type.Static<typeof AuditEventCountResponseDto>;
