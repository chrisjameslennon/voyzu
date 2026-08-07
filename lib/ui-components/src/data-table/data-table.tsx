"use client";

import type { ReactNode } from "react";
import { useRef, useEffect, useMemo, memo } from "react";

import { useIsMobile, useIsTablet } from "@voyzu/ui-layout";
import styles from "./data-table.module.css";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  header?: ReactNode;
  width?: string | number;
  align?: "left" | "center" | "right";
  hidden?: boolean;
  hideOnTablet?: boolean;
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T extends { id: Id }, Id extends number | string = number> {
  columns: DataTableColumn<T>[];
  rows: T[];
  selectedIds: Set<Id>;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: () => void;
  onSelectOne: (id: Id) => void;
  onRowClick?: (row: T) => void;
  noSelectionColumn?: boolean;
  singleSelect?: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number | string;
  filteredCount: number;
  itemLabel: string;
  hasData: boolean;
  loading?: boolean;
  loadingText?: string;
  emptyIcon?: string;
  emptyFilterIcon?: string;
  emptyTitle?: string;
  emptyText?: string;
  emptyFilterText?: string;
  className?: string;
  mobileRender?: (row: T) => ReactNode;
  showHorizontalScrollbar?: boolean;
  tableMinWidth?: string;
}

// ── Memoized row — only re-renders when selection state or row identity changes ──

type RowProps<T, Id extends number | string> = {
  row: T & { id: Id };
  visibleColumns: DataTableColumn<T>[];
  isSelected: boolean;
  onRowClick?: (row: T) => void;
  onSelectOne: (id: Id) => void;
  noSelectionColumn?: boolean;
  singleSelect?: boolean;
};

function DataTableRowInner<T extends { id: Id }, Id extends number | string>({
  row,
  visibleColumns,
  isSelected,
  onRowClick,
  onSelectOne,
  noSelectionColumn,
  singleSelect,
}: RowProps<T, Id>) {
  return (
    <tr
      className={isSelected ? styles.rowSelected : ""}
      onClick={() => onRowClick?.(row)}
    >
      {!noSelectionColumn && (
        <td className={styles.tdCheck} onClick={(e) => e.stopPropagation()}>
          <input
            type={singleSelect ? "radio" : "checkbox"}
            className={`${singleSelect ? styles.radio : styles.checkbox} ${!isSelected ? styles.checkboxHidden : ""}`}
            checked={isSelected}
            onChange={() => onSelectOne(row.id)}
          />
        </td>
      )}
      {visibleColumns.map((col) => (
        <td key={col.key} className={styles.td} style={{ textAlign: col.align }}>
          {col.render
            ? col.render(row)
            : String((row as Record<string, unknown>)[col.key] ?? "")}
        </td>
      ))}
    </tr>
  );
}

const DataTableRow = memo(DataTableRowInner, (prev, next) =>
  prev.row === next.row &&
  prev.isSelected === next.isSelected &&
  prev.visibleColumns === next.visibleColumns &&
  prev.onRowClick === next.onRowClick &&
  prev.onSelectOne === next.onSelectOne &&
  prev.noSelectionColumn === next.noSelectionColumn &&
  prev.singleSelect === next.singleSelect,
) as typeof DataTableRowInner;

// ── Main component ──

export function DataTable<T extends { id: Id }, Id extends number | string = number>({
  columns,
  rows,
  selectedIds,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  onSelectOne,
  onRowClick,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  filteredCount,
  itemLabel,
  hasData,
  loading = false,
  loadingText = "Loading...",
  emptyIcon = "inbox",
  emptyFilterIcon = "search_off",
  emptyTitle = "No items found",
  emptyText = "Get started by adding an item",
  emptyFilterText = "Try adjusting your search or filters",
  className,
  mobileRender,
  showHorizontalScrollbar = false,
  tableMinWidth,
  noSelectionColumn = false,
  singleSelect = false,
}: DataTableProps<T, Id>) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const visibleColumns = useMemo(
    () => columns.filter((col) => !col.hidden && !(col.hideOnTablet && isTablet)),
    [columns, isTablet],
  );
  const isEmpty = rows.length === 0;
  const showMobile = !!mobileRender && isMobile;
  const emptyContent = loading ? (
    <div className={styles.loadingState}>
      <span className={`material-symbols-outlined ${styles.loadingSpinner}`}>
        progress_activity
      </span>
      <p className={styles.emptyText}>{loadingText}</p>
    </div>
  ) : (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        <span className="material-symbols-outlined">
          {hasData ? emptyFilterIcon : emptyIcon}
        </span>
      </div>
      <h3 className={styles.emptyTitle}>{emptyTitle}</h3>
      <p className={styles.emptyText}>
        {hasData ? emptyFilterText : emptyText}
      </p>
    </div>
  );

  return (
    <div className={`${styles.tableCard} ${className || ""}`}>
      {!showMobile && isEmpty ? (
        <div className={styles.emptyBody}>{emptyContent}</div>
      ) : (
        <div
          className={`${styles.tableScroll} ${showHorizontalScrollbar ? styles.tableScrollVisible : ""}`}
          style={showMobile ? { display: "none" } : undefined}
        >
          <table className={styles.table} style={tableMinWidth ? { minWidth: tableMinWidth } : undefined}>
            <colgroup>
              {!noSelectionColumn && <col className={styles.colCheck} />}
              {visibleColumns.map((col) => (
                <col key={col.key} style={{ width: col.width }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {!noSelectionColumn && (
                  <th className={styles.thCheck}>
                    {!singleSelect && (
                      <input
                        type="checkbox"
                        ref={headerCheckboxRef}
                        className={styles.checkbox}
                        checked={isAllSelected}
                        onChange={onSelectAll}
                      />
                    )}
                  </th>
                )}
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    className={styles.th}
                    title={col.label}
                    style={{
                      width: col.width,
                      textAlign: col.align,
                    }}
                  >
                    {col.header ?? col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <DataTableRow
                  key={row.id}
                  row={row}
                  visibleColumns={visibleColumns}
                  isSelected={selectedIds.has(row.id)}
                  onRowClick={onRowClick}
                  onSelectOne={onSelectOne}
                  noSelectionColumn={noSelectionColumn}
                  singleSelect={singleSelect}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile stacked list */}
      {showMobile && (
        <div className={styles.mobileList}>
          {isEmpty ? (
            emptyContent
          ) : (
            rows.map((row) => {
              const isSelected = selectedIds.has(row.id);
              return (
                <div
                  key={row.id}
                  className={`${styles.mobileRow} ${isSelected ? styles.mobileRowSelected : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {!noSelectionColumn && (
                    <div className={styles.mobileRowCheck} onClick={(e) => e.stopPropagation()}>
                      <input
                        type={singleSelect ? "radio" : "checkbox"}
                        className={singleSelect ? styles.radio : styles.checkbox}
                        checked={isSelected}
                        onChange={() => onSelectOne(row.id)}
                      />
                    </div>
                  )}
                  <div className={styles.mobileRowContent}>
                    {mobileRender(row)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <div className={styles.pagination}>
        <span className={styles.paginationCount}>
          {filteredCount} of {totalCount} {itemLabel}
        </span>
        <div className={styles.paginationControls}>
          <button
            className={styles.pageBtn}
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <span className={styles.pageInfo}>
            {currentPage} of {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
