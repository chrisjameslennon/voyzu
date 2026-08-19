import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserDisplayName, UserEmail } from "./user.fields";
export const UserProfileUpdateRequestDto = StrictObject({
  email: Type.Optional(UserEmail),
  displayName: UserDisplayName,
});
export type UserProfileUpdateRequestDto = Type.Static<typeof UserProfileUpdateRequestDto>;
