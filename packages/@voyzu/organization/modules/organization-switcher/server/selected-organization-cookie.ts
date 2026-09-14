import { httpCookieDefinitions } from "@voyzu/http-api/cookies";
export const SELECTED_ORGANIZATION_COOKIE = httpCookieDefinitions.selectedOrganization.name;

export const SELECTED_ORGANIZATION_COOKIE_MAX_AGE_SECONDS = httpCookieDefinitions.selectedOrganization.maxAgeSeconds;

export function parseSelectedOrganizationId(value: string | null | undefined): number | null {
  if (!value || !/^[1-9][0-9]*$/.test(value)) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
