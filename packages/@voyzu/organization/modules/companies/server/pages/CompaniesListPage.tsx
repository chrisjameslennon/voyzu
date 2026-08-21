import "server-only";

import { headers } from "next/headers";

import { getDb } from "@voyzu/capability/db";
import type { CompanyResponseDto } from "@voyzu/organization/types/modules/companies";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";

import { CompaniesListShell } from "../../client";

type SelectOption = { value: string; label: string; code?: string };

async function fetchCompanies(): Promise<CompanyResponseDto[]> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3002";
  const cookie = requestHeaders.get("cookie");

  const response = await fetch(`${origin}/api/organization/companies`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch companies (${response.status})`);
  }

  return response.json() as Promise<CompanyResponseDto[]>;
}

async function fetchCompanyOptions(): Promise<{
  activeCountries: SelectOption[];
  countryDefaultCurrencies: Record<string, string>;
}> {
  const countries = await getDb().query(
    "SELECT code, name, currency_code FROM country WHERE status = 'ACTIVE' ORDER BY name ASC",
  );

  return {
    activeCountries: countries.rows.map((row) => ({
      value: String(row.code),
      label: String(row.name),
      code: String(row.code),
    })),
    countryDefaultCurrencies: Object.fromEntries(
      countries.rows.map((row) => [String(row.code), String(row.currency_code)]),
    ),
  };
}

export async function CompaniesListPage() {
  let companies: CompanyResponseDto[] = [];
  let error: string | null = null;
  let options: Awaited<ReturnType<typeof fetchCompanyOptions>> = {
    activeCountries: [],
    countryDefaultCurrencies: {},
  };

  try {
    [companies, options] = await Promise.all([
      fetchCompanies(),
      fetchCompanyOptions(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch companies";
  }

  if (error) {
    return (
      <div className={layoutStyles.listView}>
        <div className={layoutStyles.listBody}>
          <div className={layoutStyles.slotBody}>
            <div className={listStyles.controlPanel}>
              <strong>Unable to load companies.</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CompaniesListShell
      companies={companies}
      activeCountries={options.activeCountries}
      countryDefaultCurrencies={options.countryDefaultCurrencies}
    />
  );
}
