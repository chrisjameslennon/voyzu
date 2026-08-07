"use client";
import { useState, useCallback } from "react";
import { DataTable } from "@voyzu/ui-components";
import type { DataTableColumn } from "@voyzu/ui-components";

type Invoice = {
  id: number;
  number: string;
  customer: string;
  amount: string;
  hasPostings: boolean;
  status: string;
  date: string;
};

const INVOICES: Invoice[] = [
  { id: 1, number: "INV-2025-001", customer: "Acme Corporation", amount: "$12,450.00", hasPostings: true, status: "Paid", date: "2025-03-15" },
  { id: 2, number: "INV-2025-002", customer: "Globex Solutions", amount: "$8,200.00", hasPostings: false, status: "Pending", date: "2025-03-18" },
  { id: 3, number: "INV-2025-003", customer: "Initech Ltd", amount: "$3,750.50", hasPostings: true, status: "Overdue", date: "2025-03-10" },
  { id: 4, number: "INV-2025-004", customer: "Umbrella Corp", amount: "$24,800.00", hasPostings: false, status: "Paid", date: "2025-04-02" },
  { id: 5, number: "INV-2025-005", customer: "Dunder Mifflin", amount: "$1,650.00", hasPostings: false, status: "Draft", date: "2025-04-05" },
  { id: 6, number: "INV-2025-006", customer: "Hooli Inc", amount: "$9,100.00", hasPostings: true, status: "Pending", date: "2025-04-08" },
  { id: 7, number: "INV-2025-007", customer: "Pied Piper", amount: "$5,200.00", hasPostings: false, status: "Paid", date: "2025-04-10" },
  { id: 8, number: "INV-2025-008", customer: "Waystar Royco", amount: "$47,500.00", hasPostings: true, status: "Overdue", date: "2025-03-28" },
];

const STATUS_COLOURS: Record<string, string> = {
  Paid: "var(--voyzu-color-success-text)",
  Pending: "var(--voyzu-color-warning-text)",
  Overdue: "var(--voyzu-color-danger-text)",
  Draft: "var(--voyzu-color-text-tertiary)",
};

const COLUMNS: DataTableColumn<Invoice>[] = [
  { key: "number", label: "Invoice", width: 140 },
  { key: "customer", label: "Customer", width: 160 },
  { key: "amount", label: "Amount", width: 130, align: "right" },
  {
    key: "hasPostings",
    label: "Has Postings",
    width: 110,
    align: "center",
    render: (row) =>
      row.hasPostings ? (
        <span className="material-symbols-outlined" aria-label="Has postings" style={{ fontSize: 20 }}>
          check
        </span>
      ) : "-",
  },
  {
    key: "status",
    label: "Status",
    width: 110,
    render: (row) => (
      <span style={{ color: STATUS_COLOURS[row.status] ?? undefined, fontWeight: 600, fontSize: "0.8125rem" }}>
        {row.status}
      </span>
    ),
  },
  { key: "date", label: "Date", width: 120 },
  { key: "_spacer", label: "", render: () => null },
];

function useSelection(rows: Invoice[]) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const onSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))
    );
  }, [rows]);

  const onSelectOne = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return {
    selectedIds,
    isAllSelected: selectedIds.size === rows.length,
    isSomeSelected: selectedIds.size > 0 && selectedIds.size < rows.length,
    onSelectAll,
    onSelectOne,
  };
}

export function DataTableStandardPreview() {
  const selection = useSelection(INVOICES);
  const [page, setPage] = useState(1);

  return (
    <DataTable
      columns={COLUMNS}
      rows={INVOICES}
      {...selection}
      currentPage={page}
      totalPages={1}
      onPageChange={setPage}
      totalCount={INVOICES.length}
      filteredCount={INVOICES.length}
      itemLabel="invoices"
      hasData={true}
      emptyIcon="receipt_long"
      emptyTitle="No invoices"
      emptyText="Create your first invoice to get started"
    />
  );
}

export function DataTableSingleSelectPreview() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const rows = INVOICES.slice(0, 4);
  const [page, setPage] = useState(1);

  const onSelectOne = (id: number) => setSelectedIds(new Set([id]));

  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      selectedIds={selectedIds}
      isAllSelected={false}
      isSomeSelected={false}
      onSelectAll={() => {}}
      onSelectOne={onSelectOne}
      singleSelect
      currentPage={page}
      totalPages={1}
      onPageChange={setPage}
      totalCount={rows.length}
      filteredCount={rows.length}
      itemLabel="invoices"
      hasData={true}
    />
  );
}

export function DataTableNoSelectionPreview() {
  const [page, setPage] = useState(1);
  const rows = INVOICES.slice(0, 4);

  return (
    <DataTable
      columns={COLUMNS}
      rows={rows}
      selectedIds={new Set<number>()}
      isAllSelected={false}
      isSomeSelected={false}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      noSelectionColumn
      currentPage={page}
      totalPages={1}
      onPageChange={setPage}
      totalCount={rows.length}
      filteredCount={rows.length}
      itemLabel="invoices"
      hasData={true}
    />
  );
}

export function DataTableEmptyPreview() {
  return (
    <DataTable
      columns={COLUMNS}
      rows={[]}
      selectedIds={new Set<number>()}
      isAllSelected={false}
      isSomeSelected={false}
      onSelectAll={() => {}}
      onSelectOne={() => {}}
      currentPage={1}
      totalPages={1}
      onPageChange={() => {}}
      totalCount={0}
      filteredCount={0}
      itemLabel="invoices"
      hasData={false}
      emptyIcon="receipt_long"
      emptyTitle="No invoices yet"
      emptyText="Create your first invoice to get started"
    />
  );
}
