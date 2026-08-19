import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserAccessMode, UserRole, UserStatus } from "./user.response.dto";
import { PositiveId, UserCode, UserDisplayName, UserEmail } from "./user.fields";

export const UserUpdateRequestDto = StrictObject({
  code: UserCode,
  email: Type.Optional(UserEmail),
  displayName: UserDisplayName,
  role: UserRole, accessMode: UserAccessMode,
  showDeveloperLinks: Type.Optional(Type.Boolean()), status: UserStatus,
  companyIds: Type.Optional(Type.Array(PositiveId)),
});
export type UserUpdateRequestDto = Type.Static<typeof UserUpdateRequestDto>;
