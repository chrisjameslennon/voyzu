import "server-only";
import { OrganizationRepo } from "../db/organization.repo";


import { notFound } from "next/navigation";
import { resolveExternalUrl } from "@voyzu/ui-surface";
import { ComponentSlot, component } from "@voyzu/ui-surface/server";

import { getDb } from "@voyzu/capability/db";
import { internalApi } from "@voyzu/capability/internal-api";

import { OrganizationDetail } from "../../client";
import { getOrganization } from "../lib/organization.service";

interface OrganizationDetailPageProps {
  code?: string;
  surface?: { helpBaseUrl?: string };
}

type SelectOption = { value: string; label: string; code?: string };

async function listActiveCountries(): Promise<SelectOption[]> {
  const { rows } = await new OrganizationRepo(getDb()).listActiveCountryNames();
  return rows.map((row) => ({
    value: String(row.code),
    label: String(row.name),
    code: String(row.code),
  }));
}

export async function OrganizationDetailPage({ code, surface }: OrganizationDetailPageProps) {
  if (!code) notFound();

  const [organization, countries, currencies] = await Promise.all([
    getOrganization(decodeURIComponent(code)),
    listActiveCountries(),
    internalApi.call("@core/currency", "list", {}),
  ]);

  if (!organization) notFound();

  const extensionTabs = component.has("organizations.detail.finance")
    ? [{
        key: "finance",
        label: "Finance",
        content: <ComponentSlot id="organizations.detail.finance" organizationCode={organization.code} />,
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
      organizationOrganizationsHelpUrl={surface?.helpBaseUrl
        ? resolveExternalUrl(surface.helpBaseUrl, "concepts/organizations-and-organizations")
        : undefined}
    />
  );
}
