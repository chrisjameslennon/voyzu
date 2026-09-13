"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { OrganizationCreateRequestDto, OrganizationResponseDto } from "@voyzu/organization/types/modules/organizations";
import { Button, Breadcrumbs } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import { AddOrganizationModal } from "./AddOrganizationModal";
import { OrganizationsListContent } from "./OrganizationsListContent";

type SelectOption = { value: string; label: string; code?: string };

interface OrganizationsListShellProps {
  organizations: OrganizationResponseDto[];
  activeCountries: SelectOption[];
  countryDefaultCurrencies: Record<string, string>;
}

export function OrganizationsListShell({
  organizations,
  activeCountries,
  countryDefaultCurrencies,
}: OrganizationsListShellProps) {
  const router = useRouter();
  const [data, setData] = useState(organizations);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const createOrganization = async (value: OrganizationCreateRequestDto): Promise<string | undefined> => {
    const response = await fetch("/api/organization/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
      return body?.message ?? "An unexpected error occurred";
    }
    const created = await response.json() as OrganizationResponseDto;
    setData((current) => [...current, created].sort((left, right) => left.code.localeCompare(right.code)));
    router.push(`/organization/organizations/${encodeURIComponent(created.code)}?toast=${encodeURIComponent(`Created ${created.name}`)}`);
    router.refresh();
    return undefined;
  };

  return (
    <div className={layoutStyles.listView}>
      <header className={layoutStyles.listHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>

        <div className={layoutStyles.slotTitle}>
          <div className={listStyles.titleIcon}>
            <span className={`material-symbols-outlined ${listStyles.titleIconSymbol}`}>
              domain
            </span>
          </div>
          <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>
            Organizations
          </h1>
          <div className={layoutStyles.slotTitleByline}>
            <p className={typography.headingByline}>
              Organizations hold their own set of financial records. A organization could be a legal entity, or any other grouping you choose.
            </p>
          </div>
        </div>

        <div className={layoutStyles.slotActions}>
          <Button
            variant="primary"
            icon="add"
            className={layoutStyles.slotPrimaryAction}
            onClick={() => setIsAddOpen(true)}
          >
            Add Organization
          </Button>
        </div>
      </header>

      <OrganizationsListContent organizations={data} onOrganizationsChange={setData} />

      <AddOrganizationModal
        isOpen={isAddOpen}
        activeCountries={activeCountries}
        countryDefaultCurrencies={countryDefaultCurrencies}
        onClose={() => setIsAddOpen(false)}
        onCreate={createOrganization}
      />
    </div>
  );
}
