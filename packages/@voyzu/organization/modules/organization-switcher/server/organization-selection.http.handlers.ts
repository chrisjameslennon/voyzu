import { httpCookieDefinitions, setHttpCookie, clearHttpCookie } from "@voyzu/http-api/cookies";
import { NextResponse, type NextRequest } from "next/server";
import type { OrganizationSelectionUpdateRequestDto } from "@voyzu/organization/organization-switcher/types";

import {
  SELECTED_ORGANIZATION_COOKIE,
  SELECTED_ORGANIZATION_COOKIE_MAX_AGE_SECONDS,
  parseSelectedOrganizationId,
} from "./selected-organization-cookie";
import {
  listAccessibleOrganizationsForCurrentUser,
  listSelectableOrganizationsForCurrentUser,
  resolveOrganizationSelectionForCurrentUser,
} from "./organization-selection.service";

function applySelectedOrganizationCookie(response: NextResponse, organizationId: number) {
  setHttpCookie(response.cookies, httpCookieDefinitions.selectedOrganization, String(organizationId));
}

export async function handleGetOrganizationSelection(request: NextRequest): Promise<NextResponse> {
  const selectedOrganizationId = parseSelectedOrganizationId(request.cookies.get(SELECTED_ORGANIZATION_COOKIE)?.value);
  const { organizations, selectedOrganization } = await resolveOrganizationSelectionForCurrentUser(selectedOrganizationId);

  return NextResponse.json({
    organizations,
    selectedOrganization,
    selectedOrganizationId: selectedOrganization?.id ?? null,
  });
}

export async function handleAccessArchivedOrganization(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null) as Partial<OrganizationSelectionUpdateRequestDto> | null;
  const organizationId = parseSelectedOrganizationId(String(body?.organizationId ?? ""));

  if (!organizationId) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "A valid organizationId is required" }, { status: 400 });
  }

  const organizations = await listAccessibleOrganizationsForCurrentUser();
  const selectedOrganization = organizations.find(
    (organization) => organization.id === organizationId && organization.status === "INACTIVE",
  );
  if (!selectedOrganization) {
    return NextResponse.json({ code: "ENTITY_NOT_FOUND", message: "Archived organization was not found" }, { status: 404 });
  }

  const response = NextResponse.json({ selectedOrganizationId: selectedOrganization.id });
  applySelectedOrganizationCookie(response, selectedOrganization.id);
  return response;
}

export async function handleSetOrganizationSelection(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null) as Partial<OrganizationSelectionUpdateRequestDto> | null;
  const organizationId = parseSelectedOrganizationId(String(body?.organizationId ?? ""));

  if (!organizationId) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "A valid organizationId is required",
      },
      { status: 400 },
    );
  }

  const organizations = await listSelectableOrganizationsForCurrentUser();
  const selectedOrganization = organizations.find((organization) => organization.id === organizationId);

  if (!selectedOrganization) {
    return NextResponse.json(
      {
        code: "ENTITY_NOT_FOUND",
        message: "Organization was not found",
      },
      { status: 404 },
    );
  }

  const response = NextResponse.json({
    selectedOrganizationId: selectedOrganization.id,
  });
  applySelectedOrganizationCookie(response, selectedOrganization.id);
  return response;
}
