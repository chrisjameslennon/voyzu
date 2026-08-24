import Type from "typebox";

import { UserResponseDto } from "@voyzu/auth/types";

export const events = {
  userCreated: {
    description: "A user was created.",
    payload: UserResponseDto,
  },
  userUpdated: {
    description: "A user was updated.",
    payload: UserResponseDto,
  },
  userPasswordChanged: {
    description: "A user's password was changed.",
    payload: UserResponseDto,
  },
  userDeleted: {
    description: "A user was deleted.",
    payload: UserResponseDto,
  },
  usersCreated: {
    description: "Users were created.",
    payload: Type.Array(UserResponseDto),
  },
  usersUpdated: {
    description: "Users were updated.",
    payload: Type.Array(UserResponseDto),
  },
  usersDeleted: {
    description: "Users were deleted.",
    payload: Type.Array(UserResponseDto),
  },
  userActivated: {
    description: "A user was activated.",
    payload: UserResponseDto,
  },
  userDeactivated: {
    description: "A user was deactivated.",
    payload: UserResponseDto,
  },
  usersActivated: {
    description: "Users were activated.",
    payload: Type.Array(UserResponseDto),
  },
  usersDeactivated: {
    description: "Users were deactivated.",
    payload: Type.Array(UserResponseDto),
  },
} as const;
