"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { CompanyCreateRequestDto, CompanyResponseDto } from "@voyzu/organization/types/modules/companies";
import { Button, Breadcrumbs } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import { AddCompanyModal } from "./AddCompanyModal";
import { CompaniesListContent } from "./CompaniesListContent";

type SelectOption = { value: string; label: string; code?: string };

interface CompaniesListShellProps {
  companies: CompanyResponseDto[];
  activeCountries: SelectOption[];
  countryDefaultCurrencies: Record<string, string>;
}

export function CompaniesListShell({
  companies,
  activeCountries,
  countryDefaultCurrencies,
}: CompaniesListShellProps) {
  const router = useRouter();
  const [data, setData] = useState(companies);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const createCompany = async (value: CompanyCreateRequestDto): Promise<string | undefined> => {
    const response = await fetch("/api/organization/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
      return body?.message ?? "An unexpected error occurred";
    }
    const created = await response.json() as CompanyResponseDto;
    setData((current) => [...current, created].sort((left, right) => left.code.localeCompare(right.code)));
    router.push(`/organization/companies/${encodeURIComponent(created.code)}?toast=${encodeURIComponent(`Created ${created.name}`)}`);
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
            Companies
          </h1>
          <div className={layoutStyles.slotTitleByline}>
            <p className={typography.headingByline}>
              Companies hold their own set of financial records. A company could be a legal entity, or any other grouping you choose.
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
            Add Company
          </Button>
        </div>
      </header>

      <CompaniesListContent companies={data} onCompaniesChange={setData} />

      <AddCompanyModal
        isOpen={isAddOpen}
        activeCountries={activeCountries}
        countryDefaultCurrencies={countryDefaultCurrencies}
        onClose={() => setIsAddOpen(false)}
        onCreate={createCompany}
      />
    </div>
  );
}
