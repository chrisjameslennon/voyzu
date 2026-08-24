import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditEventResponseDto } from "./audit-event.response.dto";
export const AuditEventListResponseDto = StrictObject({
  items: Type.Array(AuditEventResponseDto),
  nextCursor: Type.Union([Type.String({ pattern: "\\S" }), Type.Null()]),
  totalMatching: Type.Integer({ minimum: 0 }),
});
export type AuditEventListResponseDto = Type.Static<typeof AuditEventListResponseDto>;
