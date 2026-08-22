"use client";

import { getStatusSemanticColor } from "@voyzu/localization/common/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { CurrencyResponseDto } from "@voyzu/localization/types/modules/currencies";
import {
  Badge,
  Button,
  DataTable,
  DropdownMenu,
  FilterChips,
  FilterPanel,
  Input,
  type DataTableColumn,
  type DropdownMenuItem,
  type FilterState,
  type FilterTab,
} from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";

const ITEMS_PER_PAGE = 100;

interface CurrenciesListContentProps {
  currencies: CurrencyResponseDto[];
}

const columns: DataTableColumn<CurrencyResponseDto>[] = [
  {
    key: "code",
    label: "Code",
    width: "12rem",
    render: (row) => <span className={listStyles.codeCell}>{row.code}</span>,
  },
  {
    key: "name",
    label: "Name",
  },
  {
    key: "symbol",
    label: "Symbol",
    width: "8rem",
    render: (row) => row.symbol ?? "-",
  },
  {
    key: "status",
    label: "Status",
    width: "8rem",
    align: "center",
    render: (row) => (
      <Badge
        variant="soft"
        size="x-small"
        color={getStatusSemanticColor(row.status)}
      >
        {row.status}
      </Badge>
    ),
  },
];

export function CurrenciesListContent({ currencies }: CurrenciesListContentProps) {
  const router = useRouter();
  const [data, setData] = useState(currencies);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({ status: ["ACTIVE"] });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueStatuses = useMemo(
    () => [...new Set(data.map((currency) => currency.status))].sort(),
    [data],
  );
  const filterTabs = useMemo<FilterTab[]>(() => [
    { key: "status", label: "Status", type: "checkbox", options: uniqueStatuses },
  ], [uniqueStatuses]);

  const filtered = useMemo(() => {
    let result = data;
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((currency) => (
        currency.code.toLowerCase().includes(query) ||
        currency.name.toLowerCase().includes(query) ||
        (currency.symbol ?? "").toLowerCase().includes(query) ||
        currency.status.toLowerCase().includes(query)
      ));
    }

    const statuses = activeFilters.status as string[] | undefined;
    if (statuses?.length) {
      result = result.filter((currency) => statuses.includes(currency.status));
    }

    return result;
  }, [activeFilters, data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const selectedCurrencies = useMemo(
    () => data.filter((currency) => selectedIds.has(currency.id)),
    [data, selectedIds],
  );
  const isAllSelected = paginated.length > 0 && paginated.every((currency) => selectedIds.has(currency.id));
  const isSomeSelected = !isAllSelected && paginated.some((currency) => selectedIds.has(currency.id));

  const handleSelectOne = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const pageIds = new Set(paginated.map((currency) => currency.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      if (paginated.every((currency) => current.has(currency.id))) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      const response = await fetch("/api/localization/currencies");
      if (response.ok) {
        setData(await response.json() as CurrencyResponseDto[]);
        setSelectedIds(new Set());
      }
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const handleExport = async (rows: CurrencyResponseDto[], filename: string) => {
    const response = await fetch("/api/capability/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename,
        columns: [
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
          { key: "symbol", label: "Symbol" },
          { key: "status", label: "Status" },
        ],
        rows,
      }),
    });

    if (!response.ok) return;

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportItems = useMemo<DropdownMenuItem[]>(() => [
    {
      value: "selected",
      label: `Selected (${selectedIds.size})`,
      icon: "check_box",
      disabled: selectedCurrencies.length === 0,
      onSelect: () => { void handleExport(selectedCurrencies, "currencies_selected"); },
    },
    {
      value: "current-view",
      label: `Current view (${filtered.length})`,
      icon: "visibility",
      disabled: filtered.length === 0,
      onSelect: () => { void handleExport(filtered, "currencies_current_view"); },
    },
    {
      value: "full-dataset",
      label: `Full dataset (${data.length})`,
      icon: "database",
      disabled: data.length === 0,
      onSelect: () => { void handleExport(data, "currencies_full_dataset"); },
    },
  ], [data, filtered, selectedCurrencies, selectedIds.size]);

  const removeFilter = (key: string) => {
    setActiveFilters((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const hasActiveFilters = Object.values(activeFilters).some((value) => Array.isArray(value) && value.length > 0);
  const hasSearch = search.trim().length > 0;

  return (
    <>
      <div className={layoutStyles.listToolbar}>
        <div className={layoutStyles.slotToolbarLeft}>
          <FilterPanel
            tabs={filterTabs}
            filters={activeFilters}
            onApply={(filters) => {
              setActiveFilters(filters);
              setCurrentPage(1);
            }}
            onClear={() => {
              setActiveFilters({});
              setCurrentPage(1);
            }}
            onRemoveFilter={removeFilter}
            showChips={false}
          />
        </div>

        <div className={layoutStyles.slotToolbarSearch}>
          <Input
            search
            containerClassName={layoutStyles.slotSearchControl}
            placeholder="Search currencies..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={layoutStyles.slotToolbarRight}>
          <div className={listStyles.toolbarActions}>
            <Button
              variant="plain"
              icon="sync"
              className={refreshing ? listStyles.spinning : undefined}
              disabled={refreshing}
              title="Refresh"
              onClick={() => { void refresh(); }}
            />
            <DropdownMenu
              trigger={<Button variant="plain" icon="file_download" title="Export" />}
              items={exportItems}
              alignment="right"
              width={260}
            />
          </div>
        </div>
      </div>

      {(hasActiveFilters || hasSearch) && (
        <div className={layoutStyles.chipsRow}>
          <div className={layoutStyles.slotChips}>
            <FilterChips
              tabs={filterTabs}
              filters={activeFilters}
              additionalChips={hasSearch
                ? [{
                    key: "search",
                    label: "Search contains",
                    value: search.trim(),
                    onRemove: () => {
                      setSearch("");
                      setCurrentPage(1);
                    },
                  }]
                : []}
              onClear={() => {
                setActiveFilters({});
                setSearch("");
                setCurrentPage(1);
              }}
              onRemoveFilter={removeFilter}
            />
          </div>
        </div>
      )}

      <div className={layoutStyles.listBody}>
        <div className={layoutStyles.slotBody}>
          <DataTable<CurrencyResponseDto, string>
            columns={columns}
            rows={paginated}
            selectedIds={selectedIds}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onRowClick={(currency) => router.push(`/settings/localization/currencies/${encodeURIComponent(currency.code)}`)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalCount={data.length}
            filteredCount={filtered.length}
            itemLabel="currencies"
            hasData={data.length > 0}
            emptyIcon="currency_exchange"
            emptyTitle="No currencies found"
            emptyText="No currencies have been configured"
            emptyFilterText="No currencies match your search"
            mobileRender={(currency) => (
              <div className={listStyles.mobileCard}>
                <div className={listStyles.mobileCode}>{currency.code}</div>
                <div className={listStyles.mobileName}>
                  <span className={listStyles.mobileNameText}>{currency.name}</span>
                </div>
                <div className={listStyles.mobileMeta}>
                  {[currency.symbol, currency.status].filter(Boolean).join(" · ")}
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
}
