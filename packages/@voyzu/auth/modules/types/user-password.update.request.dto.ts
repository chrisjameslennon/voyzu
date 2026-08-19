import Type from "typebox";
import { StrictObject } from "@voyzu/types/api";
import { UserPassword } from "./user.fields";
export const UserPasswordUpdateRequestDto = StrictObject({ password: UserPassword, confirmPassword: UserPassword });
export type UserPasswordUpdateRequestDto = Type.Static<typeof UserPasswordUpdateRequestDto>;
