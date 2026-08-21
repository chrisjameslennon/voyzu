import "server-only";

import * as service0 from "./server/lib/organization.service";

function operation<TArgs extends unknown[], TResult>(service: (...args: TArgs) => TResult) {
  return (...args: TArgs): TResult => service(...args);
}

export const getOrganization = operation(service0.getOrganization);
export const updateOrganization = operation(service0.updateOrganization);

export const operations = {
  getOrganization,
  updateOrganization,
} as const;
