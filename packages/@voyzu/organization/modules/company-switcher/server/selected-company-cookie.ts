export const SELECTED_COMPANY_COOKIE = "voyzuSelectedCompanyId";

export const SELECTED_COMPANY_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function parseSelectedCompanyId(value: string | null | undefined): number | null {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}
