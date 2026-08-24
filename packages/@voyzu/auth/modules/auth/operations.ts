import "server-only";

import * as service from "./server/auth.service";

function operation<TArgs extends unknown[], TResult>(serviceMethod: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => serviceMethod(...args);
}

export const authenticateUser = operation(service.authenticateUser);

export const operations = {
  authenticateUser,
} as const;
