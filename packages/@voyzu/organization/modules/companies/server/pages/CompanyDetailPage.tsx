import "server-only";

import { notFound } from "next/navigation";
import { resolveExternalUrl } from "@voyzu/ui-surface";

import { getDb } from "@voyzu/capability/db";
import { listCurrencies } from "@voyzu/organization/currencies/server";

import { CompanyDetail } from "../../client";
import { getCompany } from "../lib/company.service";

interface CompanyDetailPageProps {
  code?: string;
  surface?: { helpBaseUrl?: string };
}

type SelectOption = { value: string; label: string; code?: string };

async function listActiveCountries(): Promise<SelectOption[]> {
  const { rows } = await getDb().query(
    `SELECT code, name FROM country WHERE status = 'ACTIVE' ORDER BY name ASC`,
  );
  return rows.map((row) => ({
    value: String(row.code),
    label: String(row.name),
    code: String(row.code),
  }));
}

export async function CompanyDetailPage({ code, surface }: CompanyDetailPageProps) {
  if (!code) notFound();

  const [company, countries, currencies] = await Promise.all([
    getCompany(decodeURIComponent(code)),
    listActiveCountries(),
    listCurrencies(),
  ]);

  if (!company) notFound();

  return (
    <CompanyDetail
      company={company}
      activeCountries={countries}
      activeCurrencies={currencies
        .filter((currency) => currency.status === "ACTIVE")
        .map((currency) => ({
          value: currency.code,
          label: currency.name,
          code: currency.code,
        }))}
      organizationCompaniesHelpUrl={surface?.helpBaseUrl
        ? resolveExternalUrl(surface.helpBaseUrl, "concepts/organizations-and-companies")
        : undefined}
    />
  );
}
