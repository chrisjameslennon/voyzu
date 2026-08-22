import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserAccessMode, UserRole, UserStatus } from "./user.response.dto";
import { UserCode, UserDisplayName, UserEmail } from "./user.fields";

export const UserUpdateRequestDto = StrictObject({
  code: UserCode,
  email: Type.Optional(UserEmail),
  displayName: UserDisplayName,
  role: UserRole, accessMode: UserAccessMode,
  implementerAccess: Type.Optional(Type.Boolean()), status: UserStatus,
});
export type UserUpdateRequestDto = Type.Static<typeof UserUpdateRequestDto>;
