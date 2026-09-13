import { internalApi } from "@voyzu/capability/internal-api";
import { getDb, withTransaction } from "@voyzu/capability/db";
import { BusinessRuleError, InputValidationError, NotFoundError } from "@voyzu/capability/errors";
import type {
  OrganizationAccessPage,
  OrganizationAccessUser,
} from "@voyzu/organization/types/modules/organization-access";

import { listOrganizations } from "@voyzu/organization/organizations/server";
import { OrganizationAccessRepo } from "../db/organization-access.repo";

async function requireAdmin(): Promise<void> {
  if (!(await internalApi.call("@core/auth", "getCurrentIdentity", {})).permissions.includes("users.manage")) {
    throw new BusinessRuleError("Only admin users can manage organization access");
  }
}

export async function listOrganizationAccess(): Promise<OrganizationAccessPage> {
  await requireAdmin();
  const [users, organizations, organizationIdsByUser] = await Promise.all([
    internalApi.call("@core/user", "list", {}),
    listOrganizations(),
    new OrganizationAccessRepo(getDb()).listOrganizationIdsByUser(),
  ]);

  return {
    users: users.map((user) => ({
        userId: user.id,
        userCode: user.code,
        displayName: user.displayName,
        userRole: user.role,
        userStatus: user.status,
        organizationIds: user.role === "ADMIN"
          ? organizations.map((organization) => organization.id)
          : organizationIdsByUser.get(user.id) ?? [],
      })),
    organizations: organizations.map((organization) => ({
      id: organization.id,
      code: organization.code,
      name: organization.name,
      status: organization.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    })),
  };
}

export async function replaceUserOrganizationAccess(
  userCode: string,
  organizationIds: number[],
): Promise<OrganizationAccessUser> {
  await requireAdmin();
  const normalizedCode = userCode.trim().toUpperCase();
  const user = await internalApi.call("@core/user", "get", { code: normalizedCode });
  if (!user) throw new NotFoundError(`User ${normalizedCode} not found`);
  if (user.role !== "STANDARD") {
    throw new BusinessRuleError("Organization access can only be assigned to standard users");
  }

  const normalizedOrganizationIds = [...new Set(organizationIds)];
  return withTransaction(async (db) => {
    const repo = new OrganizationAccessRepo(db);
    const existingOrganizationIds = await repo.existingOrganizationIds(normalizedOrganizationIds);
    const missing = normalizedOrganizationIds.filter((organizationId) => !existingOrganizationIds.has(organizationId));
    if (missing.length > 0) {
      throw new InputValidationError(`Organization ${missing.join(", ")} not found`);
    }
    await repo.replace(user.id, normalizedOrganizationIds);
    return {
      userId: user.id,
      userCode: user.code,
      displayName: user.displayName,
      userRole: user.role,
      userStatus: user.status,
      organizationIds: normalizedOrganizationIds,
    };
  });
}

export function listOrganizationIdsForUser(userId: number): Promise<number[]> {
  return new OrganizationAccessRepo(getDb()).listOrganizationIdsForUser(userId);
}
