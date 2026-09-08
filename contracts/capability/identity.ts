import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuditUserDto } from "@voyzu/types/modules/core";
import { CurrentIdentity } from "@voyzu/types/identity";

export const identityCapability = {
  current: { input: StrictObject({}), output: CurrentIdentity },
  lookup: {
    input: StrictObject({ ids: Type.Array(Type.Integer({ minimum: 1 })) }),
    output: StrictObject({ users: Type.Array(AuditUserDto) }),
  },
} as const;
