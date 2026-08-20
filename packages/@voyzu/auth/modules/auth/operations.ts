import "server-only";

import { authenticateUser as authenticateUserService } from "./server/auth.service";

export const authenticateUser = (
  ...args: Parameters<typeof authenticateUserService>
): ReturnType<typeof authenticateUserService> => authenticateUserService(...args);

export const operations = {
  authenticateUser,
} as const;
