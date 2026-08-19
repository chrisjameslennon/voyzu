import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserAccessMode, UserRole, UserStatus } from "./user.response.dto";
import { PositiveId, UserCode, UserDisplayName, UserEmail, UserPassword } from "./user.fields";

export const UserCreateRequestDto = StrictObject({
  code: UserCode,
  email: Type.Optional(UserEmail),
  displayName: UserDisplayName,
  password: UserPassword,
  confirmPassword: UserPassword,
  role: UserRole, accessMode: UserAccessMode,
  showDeveloperLinks: Type.Optional(Type.Boolean()), status: Type.Optional(UserStatus),
  companyIds: Type.Optional(Type.Array(PositiveId)),
});
export type UserCreateRequestDto = Type.Static<typeof UserCreateRequestDto>;
