import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";

export const AuthLoginRequestDto = StrictObject({
  identifier: Type.String({ pattern: "\\S", description: "Non-blank user code, email address, or other configured login identifier." }),
  password: Type.String({ minLength: 1, description: "User password." }),
});
export type AuthLoginRequestDto = Type.Static<typeof AuthLoginRequestDto>;
