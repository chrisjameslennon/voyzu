import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserRole } from "./user.response.dto";

export const AuthUserDto = StrictObject({
  code: Type.String({ pattern: "\\S", description: "User business code." }),
  displayName: Type.String({ pattern: "\\S", description: "User display name." }),
  role: UserRole,
});
export type AuthUserDto = Type.Static<typeof AuthUserDto>;
