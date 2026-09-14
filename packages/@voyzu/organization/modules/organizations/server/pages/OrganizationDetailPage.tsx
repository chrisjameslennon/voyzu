import { pageStringParameters, type PageProps } from "@voyzu/types/page-routing";
import "server-only";
import { OrganizationRepo } from "../db/organization.repo";

import { notFound } from "next/navigation";
import { resolveExternalUrl } from "@voyzu/ui-surface";
import { internalApi } from "@voyzu/capability/internal-api";
import { OrganizationFinanceTab } from "../../client/OrganizationFinanceTab";

import { getDb } from "@voyzu/capability/db";
import { listCurrencyDirectory } from "../db/localization-directory.repo";

import { OrganizationDetail } from "../../client";
import { getOrganization } from "../lib/organization.service";

type SelectOption = { value: string; label: string; code?: string };

async function listActiveCountries(): Promise<SelectOption[]> {
  const { rows } = await new OrganizationRepo(getDb()).listActiveCountryNames();
  return rows.map((row) => ({
    value: String(row.code),
    label: String(row.name),
    code: String(row.code),
  }));
}

export async function OrganizationDetailPage({ context }: PageProps) {
  const { code } = pageStringParameters(context.pathParams);
  if (!code) notFound();

  const [organization, countries, currencies] = await Promise.all([
    getOrganization((code)),
    listActiveCountries(),
    listCurrencyDirectory(),
  ]);

  if (!organization) notFound();

  const finance = await internalApi.callOptional("@erp/organization-finance", "get", { organization_id: organization.id });
  const extensionTabs = finance
    ? [{
        key: "finance",
        label: "Ledger",
        content: <OrganizationFinanceTab organization={organization} finance={finance} />,
      }]
    : [];

  return (
    <OrganizationDetail
      organization={organization}
      extensionTabs={extensionTabs}
      activeCountries={countries}
      activeCurrencies={currencies
        .filter((currency) => currency.status === "ACTIVE")
        .map((currency) => ({
          value: currency.code,
          label: currency.name,
          code: currency.code,
        }))}
      organizationOrganizationsHelpUrl={context.routeDefinition.helpBaseUrl
        ? resolveExternalUrl(context.routeDefinition.helpBaseUrl, "concepts/organizations-and-organizations")
        : undefined}
    />
  );
}
