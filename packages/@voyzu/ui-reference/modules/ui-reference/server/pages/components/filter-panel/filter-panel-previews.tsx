"use client";
import { useState } from "react";
import { FilterPanel } from "@voyzu/ui-components";
import type { FilterTab, FilterState } from "@voyzu/ui-components";

const STATUS_TABS: FilterTab[] = [
  { key: "status", label: "Status", type: "checkbox", options: ["Paid", "Pending", "Overdue", "Draft"] },
];

const COMBINED_TABS: FilterTab[] = [
  { key: "status", label: "Status", type: "checkbox", options: ["Paid", "Pending", "Overdue", "Draft"] },
  { key: "type", label: "Type", type: "checkbox", options: ["Sales Invoice", "Credit Note", "Prepayment", "Overpayment"] },
  { key: "date", label: "Invoice Date", panelTitle: "Filter by date range", type: "daterange" },
];

function emptyState(tabs: FilterTab[]): FilterState {
  const state: FilterState = {};
  for (const tab of tabs) {
    state[tab.key] = tab.type === "checkbox" ? [] : { start: "", end: "" };
  }
  return state;
}

export function FilterPanelCheckboxPreview() {
  const [filters, setFilters] = useState<FilterState>(emptyState(STATUS_TABS));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", minHeight: "2.5rem" }}>
      <FilterPanel
        tabs={STATUS_TABS}
        filters={filters}
        onApply={setFilters}
        onClear={() => setFilters(emptyState(STATUS_TABS))}
        onRemoveFilter={(key) => setFilters((prev) => ({ ...prev, [key]: [] }))}
      />
    </div>
  );
}

export function FilterPanelCombinedPreview() {
  const [filters, setFilters] = useState<FilterState>(() => ({
    status: ["Paid"],
    type: [],
    date: { start: "", end: "" },
  }));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", minHeight: "2.5rem" }}>
      <FilterPanel
        tabs={COMBINED_TABS}
        filters={filters}
        onApply={setFilters}
        onClear={() => setFilters(emptyState(COMBINED_TABS))}
        onRemoveFilter={(key) => {
          const tab = COMBINED_TABS.find((t) => t.key === key);
          setFilters((prev) => ({
            ...prev,
            [key]: tab?.type === "daterange" ? { start: "", end: "" } : [],
          }));
        }}
      />
    </div>
  );
}
