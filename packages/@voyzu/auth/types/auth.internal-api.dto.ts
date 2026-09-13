import Type from "typebox";
import { CurrentIdentity } from "../../../../lib/types/src/identity";

export const AuthSchema = CurrentIdentity;

export const AuthGetCurrentIdentityRequestDto = Type.Object({  }, { additionalProperties: false });
