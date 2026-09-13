import Type from "typebox";
import { UserResponseDto } from "./user.response.dto";
import { AuditUserDto } from "../../../../lib/types/src/modules/core";

export const UserSchema = UserResponseDto;

export const UserGetRequestDto = Type.Object({ code: UserSchema.properties.code }, { additionalProperties: false });

export const UserGetResponseDto = Type.Union([UserSchema, Type.Null()]);

export const UserListRequestDto = Type.Object({  }, { additionalProperties: false });

export const UserListResponseDto = Type.Array(UserSchema);

export const UserGetSummariesRequestDto = Type.Object({ ids: Type.Array(Type.Integer({ minimum: 1 })) }, { additionalProperties: false });

export const UserGetSummariesResponseDto = Type.Array(AuditUserDto);
