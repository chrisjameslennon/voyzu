import Type from "typebox";
import { UserResponseDto } from "./user.response.dto";

export const UserSchema = UserResponseDto;

export const UserGetRequestDto = Type.Object({ code: UserSchema.properties.code }, { additionalProperties: false });

export const UserGetResponseDto = Type.Union([UserSchema, Type.Null()]);

