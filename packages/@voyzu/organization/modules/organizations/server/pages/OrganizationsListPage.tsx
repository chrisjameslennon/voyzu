import "server-only";
import { OrganizationRepo } from "../db/organization.repo";


import { headers } from "next/headers";

import { getDb } from "@voyzu/capability/db";
import type { OrganizationResponseDto } from "@voyzu/organization/types/modules/organizations";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";

import { OrganizationsListShell } from "../../client";

type SelectOption = { value: string; label: string; code?: string };

async function fetchOrganizations(): Promise<OrganizationResponseDto[]> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const origin = host ? `${protocol}://${host}` : "http://localhost:3002";
  const cookie = requestHeaders.get("cookie");

  const response = await fetch(`${origin}/api/organization/organizations`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch organizations (${response.status})`);
  }

  return response.json() as Promise<OrganizationResponseDto[]>;
}

async function fetchOrganizationOptions(): Promise<{
  activeCountries: SelectOption[];
  countryDefaultCurrencies: Record<string, string>;
}> {
  const countries = await new OrganizationRepo(getDb()).listActiveCountryDefaults();

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

export async function OrganizationsListPage() {
  let organizations: OrganizationResponseDto[] = [];
  let error: string | null = null;
  let options: Awaited<ReturnType<typeof fetchOrganizationOptions>> = {
    activeCountries: [],
    countryDefaultCurrencies: {},
  };

  try {
    [organizations, options] = await Promise.all([
      fetchOrganizations(),
      fetchOrganizationOptions(),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch organizations";
  }

  if (error) {
    return (
      <div className={layoutStyles.listView}>
        <div className={layoutStyles.listBody}>
          <div className={layoutStyles.slotBody}>
            <div className={listStyles.controlPanel}>
              <strong>Unable to load organizations.</strong>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OrganizationsListShell
      organizations={organizations}
      activeCountries={options.activeCountries}
      countryDefaultCurrencies={options.countryDefaultCurrencies}
    />
  );
}
