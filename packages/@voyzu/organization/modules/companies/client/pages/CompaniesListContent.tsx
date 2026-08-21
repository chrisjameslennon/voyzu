"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { CompanyResponseDto } from "@voyzu/organization/types/modules/companies";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import type { DropdownMenuItem } from "@voyzu/ui-components";
import type { FilterState, FilterTab } from "@voyzu/ui-components";
import { Toast } from "@voyzu/ui-components";
import { CompaniesTable } from "./CompaniesTable";
import { CompaniesToolbar } from "./CompaniesToolbar";

interface CompaniesListContentProps {
  companies: CompanyResponseDto[];
  onCompaniesChange: (companies: CompanyResponseDto[]) => void;
}

const getCompanyStatusLabel = (status: CompanyResponseDto["status"]) => (
  status === "INACTIVE" ? "ARCHIVED" : status
);

export function CompaniesListContent({ companies: data, onCompaniesChange }: CompaniesListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const message = searchParams.get("toast");
    if (!message) return;
    setToastMessage(message);
    setToastVisible(true);
    router.replace("/organization/companies");
  }, [router, searchParams]);

  const uniqueStatuses = useMemo(
    () => [...new Set(data.map((company) => getCompanyStatusLabel(company.status)))].sort(),
    [data],
  );
  const uniqueCountries = useMemo(
    () => [...new Set(data.map((company) => company.country?.name ?? company.countryCode))].sort(),
    [data],
  );
  const uniqueStandardSettings = useMemo(
    () => [...new Set(data.map((company) => company.useOrganizationStandardSettings ? "Yes" : "No"))].sort(),
    [data],
  );
  const filterTabs = useMemo<FilterTab[]>(() => [
    { key: "status", label: "Status", type: "checkbox", options: uniqueStatuses },
    { key: "country", label: "Country", type: "checkbox", options: uniqueCountries },
    { key: "useOrganizationStandardSettings", label: "Standard Settings", type: "checkbox", options: uniqueStandardSettings },
  ], [uniqueCountries, uniqueStandardSettings, uniqueStatuses]);

  const filtered = useMemo(() => {
    let result = data;
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((company) => (
        company.code.toLowerCase().includes(query) ||
        company.name.toLowerCase().includes(query) ||
        (company.country?.name ?? company.countryCode).toLowerCase().includes(query) ||
        company.baseCurrencyCode.toLowerCase().includes(query) ||
        (company.useOrganizationStandardSettings ? "standard settings yes" : "company settings no").includes(query) ||
        getCompanyStatusLabel(company.status).toLowerCase().includes(query)
      ));
    }

    const statuses = activeFilters.status as string[] | undefined;
    if (statuses?.length) {
      result = result.filter((company) => statuses.includes(getCompanyStatusLabel(company.status)));
    }

    const countries = activeFilters.country as string[] | undefined;
    if (countries?.length) {
      result = result.filter((company) => countries.includes(company.country?.name ?? company.countryCode));
    }

    const standardSettings = activeFilters.useOrganizationStandardSettings as string[] | undefined;
    if (standardSettings?.length) {
      result = result.filter((company) => standardSettings.includes(company.useOrganizationStandardSettings ? "Yes" : "No"));
    }

    return result;
  }, [activeFilters, data, search]);

  const selectedCompanies = useMemo(
    () => data.filter((company) => selectedIds.has(company.id)),
    [data, selectedIds],
  );
  const toggleSelectOne = (id: number) => {
    setSelectedIds((current) => {
      if (current.has(id)) return new Set();
      return new Set([id]);
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(new Set());
  };

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const handleRemoveFilter = (key: string) => {
    setActiveFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const response = await fetch("/api/organization/companies");
      if (response.ok) {
        onCompaniesChange(await response.json() as CompanyResponseDto[]);
        setSelectedIds(new Set());
      }
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleExport = async (rows: CompanyResponseDto[], filename: string) => {
    const exportColumns = [
      { key: "code", label: "Code" },
      { key: "name", label: "Name" },
      { key: "countryCode", label: "Country" },
      { key: "baseCurrencyCode", label: "Currency" },
      { key: "useOrganizationStandardSettings", label: "Use Organization Standard Settings" },
      { key: "status", label: "Status" },
    ];

    const response = await fetch("/api/capability/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, columns: exportColumns, rows }),
    });

    if (!response.ok) return;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${filename}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportItems = useMemo<DropdownMenuItem[]>(() => [
    {
      value: "selected",
      label: `Selected (${selectedIds.size})`,
      icon: "check_box",
      disabled: selectedCompanies.length === 0,
      onSelect: () => { void handleExport(selectedCompanies, "companies_selected"); },
    },
    {
      value: "current-view",
      label: `Current view (${filtered.length})`,
      icon: "visibility",
      onSelect: () => { void handleExport(filtered, "companies_current_view"); },
    },
    {
      value: "full-dataset",
      label: `Full dataset (${data.length})`,
      icon: "database",
      onSelect: () => { void handleExport(data, "companies_full_dataset"); },
    },
  ], [data, filtered, selectedCompanies, selectedIds.size]);

  return (
    <>
      <CompaniesToolbar
        refreshing={refreshing}
        search={search}
        filterTabs={filterTabs}
        filters={activeFilters}
        hasSearch={Boolean(search.trim())}
        exportItems={exportItems}
        onApplyFilters={handleApplyFilters}
        onClearFilters={() => {
          setActiveFilters({});
          setSearch("");
        }}
        onRemoveFilter={handleRemoveFilter}
        onClearSearch={() => setSearch("")}
        onRefresh={() => { void refresh(); }}
        onSearch={handleSearch}
      />

      <div className={layoutStyles.listBody}>
        <div className={layoutStyles.slotBody}>
          <CompaniesTable
            companies={filtered}
            totalCount={data.length}
            selectedIds={selectedIds}
            onSelectAll={toggleSelectAll}
            onSelectOne={toggleSelectOne}
            onRowClick={(company) => router.push(`/organization/companies/${encodeURIComponent(company.code)}`)}
          />
        </div>
      </div>

      <Toast isVisible={toastVisible} onClose={() => setToastVisible(false)} message={toastMessage} />
    </>
  );
}
