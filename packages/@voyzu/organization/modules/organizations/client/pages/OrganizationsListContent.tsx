"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { OrganizationResponseDto } from "@voyzu/organization/types/modules/organizations";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import type { DropdownMenuItem } from "@voyzu/ui-components";
import type { FilterState, FilterTab } from "@voyzu/ui-components";
import { ConfirmDialog, Toast } from "@voyzu/ui-components";
import { OrganizationsTable } from "./OrganizationsTable";
import { OrganizationsToolbar } from "./OrganizationsToolbar";

interface OrganizationsListContentProps {
  organizations: OrganizationResponseDto[];
  onOrganizationsChange: (organizations: OrganizationResponseDto[]) => void;
}

const getOrganizationStatusLabel = (status: OrganizationResponseDto["status"]) => (
  status === "INACTIVE" ? "ARCHIVED" : status
);

export function OrganizationsListContent({ organizations: data, onOrganizationsChange }: OrganizationsListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    const message = searchParams.get("toast");
    if (!message) return;
    setToastMessage(message);
    setToastVisible(true);
    router.replace("/organization/organizations");
  }, [router, searchParams]);

  const uniqueStatuses = useMemo(
    () => [...new Set(data.map((organization) => getOrganizationStatusLabel(organization.status)))].sort(),
    [data],
  );
  const uniqueCountries = useMemo(
    () => [...new Set(data.map((organization) => organization.country?.name ?? organization.countryCode))].sort(),
    [data],
  );
  const filterTabs = useMemo<FilterTab[]>(() => [
    { key: "status", label: "Status", type: "checkbox", options: uniqueStatuses },
    { key: "country", label: "Country", type: "checkbox", options: uniqueCountries },
  ], [uniqueCountries, uniqueStatuses]);

  const filtered = useMemo(() => {
    let result = data;
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((organization) => (
        organization.code.toLowerCase().includes(query) ||
        organization.name.toLowerCase().includes(query) ||
        (organization.country?.name ?? organization.countryCode).toLowerCase().includes(query) ||
        organization.baseCurrencyCode.toLowerCase().includes(query) ||
        getOrganizationStatusLabel(organization.status).toLowerCase().includes(query)
      ));
    }

    const statuses = activeFilters.status as string[] | undefined;
    if (statuses?.length) {
      result = result.filter((organization) => statuses.includes(getOrganizationStatusLabel(organization.status)));
    }

    const countries = activeFilters.country as string[] | undefined;
    if (countries?.length) {
      result = result.filter((organization) => countries.includes(organization.country?.name ?? organization.countryCode));
    }

    return result;
  }, [activeFilters, data, search]);

  const selectedOrganizations = useMemo(
    () => data.filter((organization) => selectedIds.has(organization.id)),
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
      const response = await fetch("/api/organization/organizations");
      if (response.ok) {
        onOrganizationsChange(await response.json() as OrganizationResponseDto[]);
        setSelectedIds(new Set());
      }
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const deleteSelected = async () => {
    if (selectedOrganizations.length === 0 || deleting) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/organization/organizations/batch/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: selectedOrganizations.map((organization) => organization.code) }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setToastMessage(body?.message ?? "Unable to delete organization");
        setToastVisible(true);
        return;
      }

      const deletedIds = new Set(selectedOrganizations.map((organization) => organization.id));
      const deletedName = selectedOrganizations[0]?.name ?? "organization";
      onOrganizationsChange(data.filter((organization) => !deletedIds.has(organization.id)));
      setSelectedIds(new Set());
      setIsDeleteOpen(false);
      setToastMessage(`Deleted ${deletedName}`);
      setToastVisible(true);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = async (rows: OrganizationResponseDto[], filename: string) => {
    const exportColumns = [
      { key: "code", label: "Code" },
      { key: "name", label: "Name" },
      { key: "countryCode", label: "Country" },
      { key: "baseCurrencyCode", label: "Currency" },
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
      disabled: selectedOrganizations.length === 0,
      onSelect: () => { void handleExport(selectedOrganizations, "organizations_selected"); },
    },
    {
      value: "current-view",
      label: `Current view (${filtered.length})`,
      icon: "visibility",
      onSelect: () => { void handleExport(filtered, "organizations_current_view"); },
    },
    {
      value: "full-dataset",
      label: `Full dataset (${data.length})`,
      icon: "database",
      onSelect: () => { void handleExport(data, "organizations_full_dataset"); },
    },
  ], [data, filtered, selectedOrganizations, selectedIds.size]);

  return (
    <>
      <OrganizationsToolbar
        refreshing={refreshing}
        deleting={deleting}
        hasSelection={selectedOrganizations.length > 0}
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
        onDelete={() => setIsDeleteOpen(true)}
        onRefresh={() => { void refresh(); }}
        onSearch={handleSearch}
      />

      <div className={layoutStyles.listBody}>
        <div className={layoutStyles.slotBody}>
          <OrganizationsTable
            organizations={filtered}
            totalCount={data.length}
            selectedIds={selectedIds}
            onSelectAll={toggleSelectAll}
            onSelectOne={toggleSelectOne}
            onRowClick={(organization) => router.push(`/organization/organizations/${encodeURIComponent(organization.code)}`)}
          />
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Organization"
        message="Deleting this organization will permanently delete any associated financial and other records associated with this organization. Make sure you have a full backup before proceeding."
        confirmLabel="Delete"
        confirmVariant="danger"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => { void deleteSelected(); }}
      />

      <Toast isVisible={toastVisible} onClose={() => setToastVisible(false)} message={toastMessage} />
    </>
  );
}
