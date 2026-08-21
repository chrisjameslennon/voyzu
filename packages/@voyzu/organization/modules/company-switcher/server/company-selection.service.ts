import type { CompanyResponseDto } from "@voyzu/organization/types/modules/companies";
import type { UserResponseDto } from "@voyzu/auth/types";
import { listCompanies } from "@voyzu/organization/companies/server";
import { getCurrentUser } from "@voyzu/auth/users/server";

function hasUiAccess(user: UserResponseDto | null): user is UserResponseDto {
  return user?.status === "ACTIVE" && (user.accessMode === "UI" || user.accessMode === "UI_AND_API");
}

export function filterSelectableCompanies(
  companies: CompanyResponseDto[],
  user: UserResponseDto | null,
): CompanyResponseDto[] {
  return filterAccessibleCompanies(companies, user).filter((company) => company.status === "ACTIVE");
}

export function filterAccessibleCompanies(
  companies: CompanyResponseDto[],
  user: UserResponseDto | null,
): CompanyResponseDto[] {
  if (!hasUiAccess(user)) return [];

  const accessibleCompanies = companies.filter(
    (company) => company.status === "ACTIVE" || company.status === "INACTIVE",
  );
  if (user.role === "ADMIN" || user.role === "ORGANIZATION_USER") return accessibleCompanies;

  const assignedCompanyIds = new Set(user.assignments.map((assignment) => assignment.companyId));
  return accessibleCompanies.filter((company) => assignedCompanyIds.has(company.id));
}

export function resolveCompanySelection(
  companies: CompanyResponseDto[],
  user: UserResponseDto | null,
  requestedCompanyId: number | null,
) {
  const accessibleCompanies = filterAccessibleCompanies(companies, user);
  const selectableCompanies = accessibleCompanies.filter((company) => company.status === "ACTIVE");
  const selectedCompany = accessibleCompanies.find((company) => company.id === requestedCompanyId)
    ?? selectableCompanies[0]
    ?? null;

  return { companies: selectableCompanies, selectedCompany };
}

async function listSelectableCompaniesForCurrentUserUnchecked(): Promise<CompanyResponseDto[]> {
  return filterSelectableCompanies(await listCompanies(), await getCurrentUser());
}

async function listAccessibleCompaniesForCurrentUserUnchecked(): Promise<CompanyResponseDto[]> {
  return filterAccessibleCompanies(await listCompanies(), await getCurrentUser());
}

async function resolveCompanySelectionForCurrentUserUnchecked(requestedCompanyId: number | null) {
  const [companies, user] = await Promise.all([listCompanies(), getCurrentUser()]);
  return resolveCompanySelection(companies, user, requestedCompanyId);
}

export const listSelectableCompaniesForCurrentUser = listSelectableCompaniesForCurrentUserUnchecked;
export const listAccessibleCompaniesForCurrentUser = listAccessibleCompaniesForCurrentUserUnchecked;
export const resolveCompanySelectionForCurrentUser = resolveCompanySelectionForCurrentUserUnchecked;
