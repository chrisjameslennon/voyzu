"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

import { useIsMobile } from "@voyzu/ui-layout";
import { DateRangePicker } from "./date-range-picker";
import styles from "./filter-panel.module.css";

/* ── Types ── */

export interface FilterCheckboxTab {
  key: string;
  label: string;
  panelTitle?: string;
  type: "checkbox";
  options: string[];
}

export interface FilterDateRangeTab {
  key: string;
  label: string;
  panelTitle?: string;
  type: "daterange";
}

export type FilterTab = FilterCheckboxTab | FilterDateRangeTab;

export type CheckboxFilterValue = string[];
export type DateRangeFilterValue = { start: string; end: string };
export type FilterValue = CheckboxFilterValue | DateRangeFilterValue;
export type FilterState = Record<string, FilterValue>;

/* ── Helpers ── */

function isCheckboxValue(v: FilterValue): v is CheckboxFilterValue {
  return Array.isArray(v);
}

function isDateRangeValue(v: FilterValue): v is DateRangeFilterValue {
  return !Array.isArray(v) && typeof v === "object" && "start" in v;
}

function getActiveCount(filters: FilterState, key: string): number {
  const val = filters[key];
  if (!val) return 0;
  if (isCheckboxValue(val)) return val.length;
  if (isDateRangeValue(val)) return val.start || val.end ? 1 : 0;
  return 0;
}

function hasAnyFilters(filters: FilterState): boolean {
  return Object.keys(filters).some((k) => getActiveCount(filters, k) > 0);
}

function emptyState(tabs: FilterTab[]): FilterState {
  const state: FilterState = {};
  for (const tab of tabs) {
    state[tab.key] = tab.type === "checkbox" ? [] : { start: "", end: "" };
  }
  return state;
}

function deepCopy(filters: FilterState): FilterState {
  const copy: FilterState = {};
  for (const [k, v] of Object.entries(filters)) {
    copy[k] = isCheckboxValue(v) ? [...v] : { ...v };
  }
  return copy;
}

/* ── Component ── */

export interface FilterPanelProps {
  tabs: FilterTab[];
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  onRemoveFilter: (key: string) => void;
  showChips?: boolean;
  /** When true, the dropdown opens leftward and panels/arrows are mirrored */
  reversed?: boolean;
}

export function FilterPanel({ tabs, filters, onApply, onClear, onRemoveFilter, showChips = true, reversed = false }: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState<string | null>(null);
  const [tempFilters, setTempFilters] = useState<FilterState>(() => deepCopy(filters));
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, right: 0, maxHeight: 400 });
  const isMobile = useIsMobile();

  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const hasActive = hasAnyFilters(filters);

  // Sync temp filters when panel opens
  useEffect(() => {
    if (isOpen) {
      setTempFilters(deepCopy(filters));
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const toggleOpen = () => {
    if (!isOpen) {
      setActiveTabKey(null);
      if (btnRef.current) {
        const rect = btnRef.current.getBoundingClientRect();
        const maxHeight = Math.min(400, window.innerHeight - rect.bottom - 12);
        if (reversed) {
          setDropdownPos({ top: rect.bottom + 4, left: 0, right: window.innerWidth - rect.right, maxHeight });
        } else {
          setDropdownPos({ top: rect.bottom + 4, left: rect.left, right: 0, maxHeight });
        }
      }
    }
    setIsOpen(!isOpen);
  };

  const handleCheckboxChange = (tabKey: string, option: string) => {
    setTempFilters((prev) => {
      const current = (prev[tabKey] as string[]) || [];
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      return { ...prev, [tabKey]: next };
    });
  };

  const handleDateChange = (tabKey: string, field: "start" | "end", value: string) => {
    setTempFilters((prev) => {
      const current = (prev[tabKey] as DateRangeFilterValue) || { start: "", end: "" };
      return { ...prev, [tabKey]: { ...current, [field]: value } };
    });
  };

  const handleApply = () => {
    onApply(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempFilters(emptyState(tabs));
  };

  const activeTab = tabs.find((t) => t.key === activeTabKey);
  const isDateTab = activeTab?.type === "daterange";

  // Build chips
  const chipNodes: ReactNode[] = [];
  let chipIndex = 0;
  for (const tab of tabs) {
    const val = filters[tab.key];
    if (!val || getActiveCount(filters, tab.key) === 0) continue;

    if (chipIndex > 0) {
      chipNodes.push(
        <span key={`and-${tab.key}`} className={styles.chipAnd}>AND</span>,
      );
    }

    if (isCheckboxValue(val) && val.length > 0) {
      chipNodes.push(
        <div key={tab.key} className={styles.chip} title={val.join(" or ")}>
          <span className={styles.chipKey}>{tab.label} is</span>
          <span className={styles.chipValue}>{val.join(" or ")}</span>
          <button
            onClick={(e) => { e.preventDefault(); onRemoveFilter(tab.key); }}
            className={styles.chipClose}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </button>
        </div>,
      );
    } else if (isDateRangeValue(val) && (val.start || val.end)) {
      const label = [val.start, val.end].filter(Boolean).join(" \u2013 ");
      chipNodes.push(
        <div key={tab.key} className={styles.chip} title={label}>
          <span className={styles.chipKey}>{tab.label}</span>
          <span className={styles.chipValue}>{label}</span>
          <button
            onClick={(e) => { e.preventDefault(); onRemoveFilter(tab.key); }}
            className={styles.chipClose}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </button>
        </div>,
      );
    }
    chipIndex++;
  }

  return (
    <>
      {/* Trigger + Dropdown wrapper — relative so dropdown positions against it */}
      <div className={styles.triggerWrap}>
        <button
          ref={btnRef}
          onClick={toggleOpen}
          className={`${styles.trigger} ${isOpen || hasActive ? styles.triggerActive : ""}`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>filter_list</span>
          <span>Filter</span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div
            ref={dropdownRef}
            className={`${styles.dropdown} ${
              isMobile
                ? ""
                : !activeTab ? styles.dropdownCollapsed : isDateTab ? styles.dropdownWide : ""
            } ${reversed ? styles.dropdownReversed : ""}`}
            style={reversed
              ? { top: dropdownPos.top, right: dropdownPos.right, maxHeight: dropdownPos.maxHeight }
              : { top: dropdownPos.top, left: dropdownPos.left, maxHeight: dropdownPos.maxHeight }}
          >
          {/* Sidebar — always on desktop; on mobile only when no category is selected */}
          {(!isMobile || !activeTab) && (
            <div className={styles.sidebar} style={!activeTab ? { borderRight: "none", borderLeft: "none" } : reversed ? { borderRight: "none", borderLeft: "1px solid var(--gray-100)" } : undefined}>
              <div className={styles.sidebarTabs}>
                {tabs.map((tab) => {
                  const count = getActiveCount(tempFilters, tab.key);
                  const isActive = activeTabKey === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTabKey(isMobile ? tab.key : activeTabKey === tab.key ? null : tab.key)}
                      className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
                      style={reversed ? { flexDirection: "row-reverse" } : undefined}
                    >
                      <div className={styles.tabBtnLeft}>
                        <span>{tab.label}</span>
                        {count > 0 && <span className={styles.tabBadge}>{count}</span>}
                      </div>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        {!isMobile && (reversed ? (isActive ? "chevron_right" : "chevron_left") : (isActive ? "chevron_left" : "chevron_right"))}
                        {isMobile && "chevron_right"}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className={styles.sidebarFooter}>
                {!isMobile && (
                  <button onClick={handleApply} className={styles.btnApply}>Apply</button>
                )}
                <button onClick={handleReset} className={styles.btnReset}>Reset</button>
              </div>
            </div>
          )}

          {/* Content */}
          {activeTab && (
            <div className={styles.content}>
              {activeTab.type === "checkbox" && (
                <div className={styles.checkboxContent}>
                  <div className={styles.contentHeader}>
                    {isMobile && (
                      <button onClick={() => setActiveTabKey(null)} className={styles.backBtn}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
                      </button>
                    )}
                    <h3 className={styles.contentTitle}>{activeTab.panelTitle ?? activeTab.label}</h3>
                  </div>
                  <div className={styles.checkboxList}>
                    {activeTab.options.map((option) => {
                      const checked = ((tempFilters[activeTab.key] as string[]) || []).includes(option);
                      return (
                        <label key={option} className={styles.checkboxItem}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => handleCheckboxChange(activeTab.key, option)}
                            className={styles.checkbox}
                          />
                          <span className={`${styles.checkboxLabel} ${checked ? styles.checkboxLabelChecked : ""}`}>
                            {option}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {isMobile && (
                    <div className={styles.mobileContentFooter}>
                      <button onClick={handleApply} className={styles.btnApply}>Apply</button>
                    </div>
                  )}
                </div>
              )}

              {activeTab.type === "daterange" && (
                <div className={styles.dateContent}>
                  <div className={styles.contentHeader}>
                    {isMobile && (
                      <button onClick={() => setActiveTabKey(null)} className={styles.backBtn}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
                      </button>
                    )}
                    <h3 className={styles.contentTitle}>{activeTab.panelTitle ?? activeTab.label}</h3>
                  </div>
                  <div className={styles.datePickerWrap}>
                    <DateRangePicker
                      startDate={((tempFilters[activeTab.key] as DateRangeFilterValue) || { start: "", end: "" }).start}
                      endDate={((tempFilters[activeTab.key] as DateRangeFilterValue) || { start: "", end: "" }).end}
                      onStartDateChange={(d) => handleDateChange(activeTab.key, "start", d)}
                      onEndDateChange={(d) => handleDateChange(activeTab.key, "end", d)}
                    />
                  </div>
                  {isMobile && (
                    <div className={styles.mobileContentFooter}>
                      <button onClick={handleApply} className={styles.btnApply}>Apply</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        )}
      </div>

      {/* Filter chips (inline) */}
      {showChips && hasActive && (
        <>
          <div className={styles.chipDivider} />
          {chipNodes}
          <button onClick={onClear} className={styles.clearAll}>Clear all</button>
        </>
      )}
    </>
  );
}

/* ── Filter text summary for use outside the component (e.g. report footers) ── */

export function buildFilterText(tabs: FilterTab[], filters: FilterState): string {
  return tabs
    .filter((tab) => {
      const val = filters[tab.key];
      return Array.isArray(val) && val.length > 0;
    })
    .map((tab) => `${tab.label} is ${(filters[tab.key] as string[]).join(" or ")}`)
    .join(" and ");
}

/* ── Standalone chip strip for rendering chips outside the toolbar row ── */

export interface FilterChipsProps {
  tabs: FilterTab[];
  filters: FilterState;
  additionalChips?: Array<{
    key: string;
    label: string;
    value: string;
    onRemove: () => void;
  }>;
  onClear: () => void;
  onRemoveFilter: (key: string) => void;
}

export function FilterChips({ tabs, filters, additionalChips = [], onClear, onRemoveFilter }: FilterChipsProps) {
  if (!hasAnyFilters(filters) && additionalChips.length === 0) return null;

  const chipNodes: ReactNode[] = [];
  let chipIndex = 0;
  for (const tab of tabs) {
    const val = filters[tab.key];
    if (!val || getActiveCount(filters, tab.key) === 0) continue;

    if (chipIndex > 0) {
      chipNodes.push(<span key={`and-${tab.key}`} className={styles.chipAnd}>AND</span>);
    }

    if (isCheckboxValue(val) && val.length > 0) {
      chipNodes.push(
        <div key={tab.key} className={styles.chip} title={val.join(" or ")}>
          <span className={styles.chipKey}>{tab.label} is</span>
          <span className={styles.chipValue}>{val.join(" or ")}</span>
          <button
            onClick={(e) => { e.preventDefault(); onRemoveFilter(tab.key); }}
            className={styles.chipClose}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </button>
        </div>,
      );
    } else if (isDateRangeValue(val) && (val.start || val.end)) {
      const label = [val.start, val.end].filter(Boolean).join(" \u2013 ");
      chipNodes.push(
        <div key={tab.key} className={styles.chip} title={label}>
          <span className={styles.chipKey}>{tab.label}</span>
          <span className={styles.chipValue}>{label}</span>
          <button
            onClick={(e) => { e.preventDefault(); onRemoveFilter(tab.key); }}
            className={styles.chipClose}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
          </button>
        </div>,
      );
    }
    chipIndex++;
  }

  for (const chip of additionalChips) {
    if (chipIndex > 0) {
      chipNodes.push(<span key={`and-${chip.key}`} className={styles.chipAnd}>AND</span>);
    }

    chipNodes.push(
      <div key={chip.key} className={styles.chip} title={chip.value}>
        <span className={styles.chipKey}>{chip.label}</span>
        <span className={styles.chipValue}>{chip.value}</span>
        <button
          onClick={(event) => {
            event.preventDefault();
            chip.onRemove();
          }}
          className={styles.chipClose}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
        </button>
      </div>,
    );
    chipIndex++;
  }

  return (
    <>
      {chipNodes}
      <button onClick={onClear} className={styles.clearAll}>Clear all</button>
    </>
  );
}
