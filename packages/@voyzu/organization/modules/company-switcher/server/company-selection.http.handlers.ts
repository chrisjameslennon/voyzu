import { NextResponse, type NextRequest } from "next/server";
import type { CompanySelectionUpdateRequestDto } from "@voyzu/organization/company-switcher/types";

import {
  SELECTED_COMPANY_COOKIE,
  SELECTED_COMPANY_COOKIE_MAX_AGE_SECONDS,
  parseSelectedCompanyId,
} from "./selected-company-cookie";
import {
  listAccessibleCompaniesForCurrentUser,
  listSelectableCompaniesForCurrentUser,
  resolveCompanySelectionForCurrentUser,
} from "./company-selection.service";

function applySelectedCompanyCookie(response: NextResponse, companyId: number) {
  response.cookies.set(SELECTED_COMPANY_COOKIE, String(companyId), {
    httpOnly: true,
    maxAge: SELECTED_COMPANY_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
  });
}

export async function handleGetCompanySelection(request: NextRequest): Promise<NextResponse> {
  const selectedCompanyId = parseSelectedCompanyId(request.cookies.get(SELECTED_COMPANY_COOKIE)?.value);
  const { companies, selectedCompany } = await resolveCompanySelectionForCurrentUser(selectedCompanyId);

  return NextResponse.json({
    companies,
    selectedCompany,
    selectedCompanyId: selectedCompany?.id ?? null,
  });
}

export async function handleAccessArchivedCompany(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null) as Partial<CompanySelectionUpdateRequestDto> | null;
  const companyId = parseSelectedCompanyId(String(body?.companyId ?? ""));

  if (!companyId) {
    return NextResponse.json({ code: "VALIDATION_ERROR", message: "A valid companyId is required" }, { status: 400 });
  }

  const companies = await listAccessibleCompaniesForCurrentUser();
  const selectedCompany = companies.find(
    (company) => company.id === companyId && company.status === "INACTIVE",
  );
  if (!selectedCompany) {
    return NextResponse.json({ code: "ENTITY_NOT_FOUND", message: "Archived company was not found" }, { status: 404 });
  }

  const response = NextResponse.json({ selectedCompanyId: selectedCompany.id });
  applySelectedCompanyCookie(response, selectedCompany.id);
  return response;
}

export async function handleSetCompanySelection(request: NextRequest): Promise<NextResponse> {
  const body = await request.json().catch(() => null) as Partial<CompanySelectionUpdateRequestDto> | null;
  const companyId = parseSelectedCompanyId(String(body?.companyId ?? ""));

  if (!companyId) {
    return NextResponse.json(
      {
        code: "VALIDATION_ERROR",
        message: "A valid companyId is required",
      },
      { status: 400 },
    );
  }

  const companies = await listSelectableCompaniesForCurrentUser();
  const selectedCompany = companies.find((company) => company.id === companyId);

  if (!selectedCompany) {
    return NextResponse.json(
      {
        code: "ENTITY_NOT_FOUND",
        message: "Company was not found",
      },
      { status: 404 },
    );
  }

  const response = NextResponse.json({
    selectedCompanyId: selectedCompany.id,
  });
  applySelectedCompanyCookie(response, selectedCompany.id);
  return response;
}
