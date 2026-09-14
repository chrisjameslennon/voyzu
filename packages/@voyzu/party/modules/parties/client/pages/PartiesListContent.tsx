"use client";

import { getStatusSemanticColor } from "@voyzu/party/common/client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { PartyResponseDto } from "@voyzu/party/types/modules/parties";
import {
  Badge,
  ConfirmDialog,
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

interface PartiesListContentProps {
  parties: PartyResponseDto[];
}

const columns: DataTableColumn<PartyResponseDto>[] = [
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

export function PartiesListContent({ parties }: PartiesListContentProps) {
  const router = useRouter();
  const [data, setData] = useState(parties);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({ status: ["ACTIVE"] });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const uniqueStatuses = useMemo(
    () => [...new Set(data.map((party) => party.status))].sort(),
    [data],
  );
  const filterTabs = useMemo<FilterTab[]>(() => [
    { key: "status", label: "Status", type: "checkbox", options: uniqueStatuses },
  ], [uniqueStatuses]);

  const filtered = useMemo(() => {
    let result = data;
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((party) => (
        party.code.toLowerCase().includes(query) ||
        party.name.toLowerCase().includes(query) ||
        party.status.toLowerCase().includes(query)
      ));
    }

    const statuses = activeFilters.status as string[] | undefined;
    if (statuses?.length) {
      result = result.filter((party) => statuses.includes(party.status));
    }

    return result;
  }, [activeFilters, data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const selectedParties = useMemo(
    () => data.filter((party) => selectedIds.has(party.id)),
    [data, selectedIds],
  );
  const isAllSelected = paginated.length > 0 && paginated.every((party) => selectedIds.has(party.id));
  const isSomeSelected = !isAllSelected && paginated.some((party) => selectedIds.has(party.id));

  const handleSelectOne = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    const pageIds = new Set(paginated.map((party) => party.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      if (paginated.every((party) => current.has(party.id))) {
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
    setError("");
    try {
      const response = await fetch("/api/parties");
      if (!response.ok) throw new Error("Unable to refresh parties");
      setData(await response.json() as PartyResponseDto[]);
      setCurrentPage(1);
      setSelectedIds(new Set());
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to refresh parties");
    } finally {
      setRefreshing(false);
    }
  };

  const applyAction = async (action: "activate" | "deactivate" | "delete") => {
    if (busy) return;
    setBusy(true); setError(""); setConfirmDelete(false);
    try {
      const response = await fetch(`/api/parties/batch/${action}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codes: selectedParties.map(party => party.code) }),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message ?? body.error?.message ?? "Unable to update parties");
      }
      await refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to update parties"); }
    finally { setBusy(false); }
  };

  const handleExport = async (rows: PartyResponseDto[], filename: string) => {
    const response = await fetch("/api/capability/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename,
        columns: [
          { key: "code", label: "Code" },
          { key: "name", label: "Name" },
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
      disabled: selectedParties.length === 0,
      onSelect: () => { void handleExport(selectedParties, "parties_selected"); },
    },
    {
      value: "current-view",
      label: `Current view (${filtered.length})`,
      icon: "visibility",
      disabled: filtered.length === 0,
      onSelect: () => { void handleExport(filtered, "parties_current_view"); },
    },
    {
      value: "full-dataset",
      label: `Full dataset (${data.length})`,
      icon: "database",
      disabled: data.length === 0,
      onSelect: () => { void handleExport(data, "parties_full_dataset"); },
    },
  ], [data, filtered, selectedParties, selectedIds.size]);

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
      {error && <p role="alert">{error}</p>}
      <ConfirmDialog isOpen={confirmDelete} title="Delete parties" message={`Delete ${selectedIds.size} selected parties?`} confirmLabel="Delete" onClose={() => setConfirmDelete(false)} onConfirm={() => void applyAction("delete")} />
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
            placeholder="Search parties..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className={layoutStyles.slotToolbarRight}>
          <div className={listStyles.toolbarActions}>
            <Button variant="secondary" icon="check_circle" disabled={busy || !selectedParties.some(party => party.status === "INACTIVE")} onClick={() => void applyAction("activate")}>Activate</Button>
            <Button variant="secondary" icon="block" disabled={busy || !selectedParties.some(party => party.status === "ACTIVE")} onClick={() => void applyAction("deactivate")}>Deactivate</Button>
            <Button variant="secondary-destructive" icon="delete" title="Delete" disabled={busy || !selectedIds.size} onClick={() => setConfirmDelete(true)} />
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
          <DataTable<PartyResponseDto, number>
            columns={columns}
            rows={paginated}
            selectedIds={selectedIds}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onRowClick={(party) => router.push(`/settings/parties/${encodeURIComponent(party.code)}`)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalCount={data.length}
            filteredCount={filtered.length}
            itemLabel="parties"
            hasData={data.length > 0}
            emptyIcon="groups"
            emptyTitle="No parties found"
            emptyText="No parties have been configured"
            emptyFilterText="No parties match your search"
            mobileRender={(party) => (
              <div className={listStyles.mobileCard}>
                <div className={listStyles.mobileCode}>{party.code}</div>
                <div className={listStyles.mobileName}>
                  <span className={listStyles.mobileNameText}>{party.name}</span>
                </div>
                <div className={listStyles.mobileMeta}>
                  {party.status}
                </div>
              </div>
            )}
          />
        </div>
      </div>
    </>
  );
}
