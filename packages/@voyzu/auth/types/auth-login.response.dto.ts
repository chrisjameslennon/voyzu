import Type from "typebox";
import { StrictObject } from "@voyzu/types/http-api";
import { AuthUserDto } from "./auth-user.dto";

export const AuthLoginResponseDto = StrictObject({ user: AuthUserDto });
export type AuthLoginResponseDto = Type.Static<typeof AuthLoginResponseDto>;
