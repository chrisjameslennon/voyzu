import "server-only";

import { UserRole } from "@voyzu/auth/types";
import { operation } from "@voyzu/capability/operations";
import Type from "typebox";

const AuthenticatedUser = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  code: Type.String(),
  displayName: Type.String(),
  role: UserRole,
});

export const authenticateUser = operation.defineLazy(
  {
    parameters: Type.Tuple([Type.String(), Type.String()]),
    result: AuthenticatedUser,
  },
  () => import("./server/auth.service").then((module) => module.authenticateUser),
);

export const operations = {
  authenticateUser,
} as const;
