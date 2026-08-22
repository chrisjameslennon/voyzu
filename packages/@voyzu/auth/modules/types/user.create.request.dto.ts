import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserAccessMode, UserRole, UserStatus } from "./user.response.dto";
import { UserCode, UserDisplayName, UserEmail, UserPassword } from "./user.fields";

export const UserCreateRequestDto = StrictObject({
  code: UserCode,
  email: Type.Optional(UserEmail),
  displayName: UserDisplayName,
  password: UserPassword,
  confirmPassword: UserPassword,
  role: UserRole, accessMode: UserAccessMode,
  implementerAccess: Type.Optional(Type.Boolean()), status: Type.Optional(UserStatus),
});
export type UserCreateRequestDto = Type.Static<typeof UserCreateRequestDto>;
