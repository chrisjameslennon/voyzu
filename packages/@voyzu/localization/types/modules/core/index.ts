import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const OperationReference = StrictObject({ type: Type.String(), code: Type.String() });
export type OperationReference = Type.Static<typeof OperationReference>;

export {
  ActorType, AuditMetadataDto, AuditStampDto, AuditUserDto, Status,
} from "@voyzu/types/modules/core";
export type { OperationBlocker } from "@voyzu/types/modules/core";
