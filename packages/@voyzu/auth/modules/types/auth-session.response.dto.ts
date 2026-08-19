import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { AuthUserDto } from "./auth-user.dto";

export const AuthSessionResponseDto = StrictObject({
  authenticated: Type.Boolean({ description: "Whether the request has an authenticated UI session." }),
  user: Type.Optional(Type.Union([AuthUserDto, Type.Null()], { description: "Authenticated user, when a session exists." })),
});
export type AuthSessionResponseDto = Type.Static<typeof AuthSessionResponseDto>;
