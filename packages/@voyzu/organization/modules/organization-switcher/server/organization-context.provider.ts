import "server-only";
import { cookies } from "next/headers";
import { NotFoundError } from "@voyzu/capability/errors";
import {
  SELECTED_ORGANIZATION_COOKIE, SELECTED_ORGANIZATION_COOKIE_MAX_AGE_SECONDS,
  parseSelectedOrganizationId,
} from "./selected-organization-cookie";
import {
  listSelectableOrganizationsForCurrentUser, resolveOrganizationSelectionForCurrentUser,
} from "./organization-selection.service";

export async function getSavedOrganizationId(_input: Record<string, never>) {
  const store = await cookies();
  return { organizationId: parseSelectedOrganizationId(store.get(SELECTED_ORGANIZATION_COOKIE)?.value) };
}

export async function getAvailableOrganizations(_input: Record<string, never>) {
  return { organizations: await listSelectableOrganizationsForCurrentUser() };
}

export async function getActiveOrganization(_input: Record<string, never>) {
  const { organizationId } = await getSavedOrganizationId({});
  const { selectedOrganization } = await resolveOrganizationSelectionForCurrentUser(organizationId);
  return { selectedOrganization };
}

/** Must be called from a route handler/server action, where response cookies may be written. */
export async function setActiveOrganization({ organizationId }: { organizationId: number }) {
  const organizations = await listSelectableOrganizationsForCurrentUser();
  if (!organizations.some((organization) => organization.id === organizationId)) {
    throw new NotFoundError("Organization was not found");
  }
  const store = await cookies();
  store.set(SELECTED_ORGANIZATION_COOKIE, String(organizationId), {
    httpOnly: true, maxAge: SELECTED_ORGANIZATION_COOKIE_MAX_AGE_SECONDS,
    path: "/", sameSite: "lax",
  });
  return { selectedOrganizationId: organizationId };
}
