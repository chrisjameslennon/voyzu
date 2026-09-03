import "server-only";

import { UserRole } from "@voyzu/auth/types";
import { command } from "@voyzu/capability/commands";
import Type from "typebox";

const AuthenticatedUser = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  code: Type.String(),
  displayName: Type.String(),
  role: UserRole,
});

export const authenticateUser = command.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), Type.String()]),
    result: AuthenticatedUser,
  },
  () => import("./server/auth.service").then((module) => module.authenticateUser),
);

export const commands = {
  authenticateUser,
} as const;
