"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  ForwardedRef,
  KeyboardEvent,
  ReactElement,
  RefObject,
  RefAttributes,
} from "react";

import { fieldHasError } from "../lib/validation/validation-rules";
import type { FieldDescriptor, FieldRule } from "../lib/validation/validation-rules";
import { SearchableSelect } from "../searchable-select/searchable-select";
import styles from "./editable-grid.module.css";

export type EditableGridCellType = "text" | "number" | "select" | "checkbox";
export type EditableGridRowId = number | string;

export interface EditableGridRow {
  id: EditableGridRowId;
}

export interface EditableGridOption {
  value: string;
  label: string;
  code?: string;
}

export interface EditableGridColumn<T extends EditableGridRow> {
  key: Extract<keyof T, string>;
  label: string;
  type: EditableGridCellType;
  width?: number | string;
  align?: "left" | "center" | "right";
  readOnly?: boolean;
  options?: readonly EditableGridOption[];
  searchable?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  rules?: readonly FieldRule[];
  calculate?: (row: Readonly<T>) => T[Extract<keyof T, string>];
  format?: (value: T[Extract<keyof T, string>], row: Readonly<T>) => string;
}

export interface EditableGridValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface EditableGridHandle<T extends EditableGridRow> {
  attemptValidation: () => EditableGridValidationResult;
  getRows: () => T[];
  resetValidation: () => void;
  resetRows: (rows?: T[]) => void;
}

export interface EditableGridProps<T extends EditableGridRow> {
  columns: readonly EditableGridColumn<T>[];
  initialRows: readonly T[];
  onRowsChange?: (rows: T[]) => void;
  onValidationChange?: (result: EditableGridValidationResult) => void;
  allowAddRows?: boolean;
  allowDeleteRows?: boolean;
  createRow?: (rows: readonly T[]) => T;
  addRowLabel?: string;
  emptyText?: string;
  ariaLabel?: string;
  className?: string;
}

type CellPosition = { row: number; column: number };
type EditState = CellPosition & { draft: string; selectOnFocus: boolean };

function cellString(value: unknown, type: EditableGridCellType): string {
  if (type === "checkbox") return value === true ? "true" : "";
  return value === null || value === undefined ? "" : String(value);
}

function displayValue<T extends EditableGridRow>(
  row: T,
  column: EditableGridColumn<T>,
): string {
  const value = row[column.key];
  if (column.format) return column.format(value, row);
  if (column.type === "checkbox") return value === true ? "Yes" : "No";
  if (column.type === "select") {
    return column.options?.find((option) => option.value === String(value))?.label
      ?? cellString(value, column.type);
  }
  return cellString(value, column.type);
}

function applyCalculations<T extends EditableGridRow>(
  source: T,
  columns: readonly EditableGridColumn<T>[],
): T {
  let row = { ...source } as T;
  for (const column of columns) {
    if (!column.calculate) continue;
    row = { ...row, [column.key]: column.calculate(row) };
  }
  return row;
}

function validationResult<T extends EditableGridRow>(
  rows: readonly T[],
  columns: readonly EditableGridColumn<T>[],
): EditableGridValidationResult {
  const errors: string[] = [];

  rows.forEach((row, rowIndex) => {
    for (const column of columns) {
      if (!column.rules?.length) continue;
      const field: FieldDescriptor = {
        label: column.label,
        value: cellString(row[column.key], column.type),
        rules: [...column.rules],
      };
      for (const rule of field.rules) {
        const invalid = rule.kind === "required"
          ? !field.value.trim()
          : !rule.test(field.value);
        if (!invalid) continue;
        errors.push(
          rule.kind === "required"
            ? `Row ${rowIndex + 1}: ${column.label} is required`
            : `Row ${rowIndex + 1}, ${column.label}: ${rule.message}`,
        );
        break;
      }
    }
  });

  return { isValid: errors.length === 0, errors };
}

function EditableGridInner<T extends EditableGridRow>(
  {
    columns,
    initialRows,
    onRowsChange,
    onValidationChange,
    allowAddRows = false,
    allowDeleteRows = false,
    createRow,
    addRowLabel = "Add row",
    emptyText = "No rows",
    ariaLabel = "Editable grid",
    className,
  }: EditableGridProps<T>,
  ref: ForwardedRef<EditableGridHandle<T>>,
) {
  const initialRowsRef = useRef(initialRows.map((row) => applyCalculations(row, columns)));
  const [rows, setRows] = useState<T[]>(initialRowsRef.current);
  const [selected, setSelected] = useState<CellPosition | null>(
    initialRowsRef.current.length && columns.length ? { row: 0, column: 0 } : null,
  );
  const [editing, setEditing] = useState<EditState | null>(null);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const cellRefs = useRef(new Map<string, HTMLTableCellElement>());
  const editRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  const validation = useMemo(
    () => validationResult(rows, columns),
    [rows, columns],
  );
  const editingRow = editing?.row;
  const editingColumn = editing?.column;
  const selectEditorOnFocus = editing?.selectOnFocus;

  useEffect(() => {
    if (validationAttempted) onValidationChange?.(validation);
  }, [onValidationChange, validation, validationAttempted]);

  useEffect(() => {
    if (editingRow !== undefined && editingColumn !== undefined) {
      editRef.current?.focus();
      if (
        selectEditorOnFocus &&
        editRef.current instanceof HTMLInputElement
      ) {
        editRef.current.select();
      }
      return;
    }
    if (selected) cellRefs.current.get(`${selected.row}:${selected.column}`)?.focus();
  }, [editingColumn, editingRow, selectEditorOnFocus, selected]);

  function publishRows(nextRows: T[]) {
    setRows(nextRows);
    onRowsChange?.(nextRows);
  }

  function updateCell(rowIndex: number, columnIndex: number, value: unknown) {
    const column = columns[columnIndex];
    if (!column || column.readOnly || column.calculate) return;
    const nextRows = rows.map((row, index) => index === rowIndex
      ? applyCalculations({ ...row, [column.key]: value } as T, columns)
      : row);
    publishRows(nextRows);
  }

  function move(position: CellPosition, rowDelta: number, columnDelta: number) {
    if (!rows.length || !columns.length) return;
    setSelected({
      row: Math.max(0, Math.min(rows.length - 1, position.row + rowDelta)),
      column: Math.max(0, Math.min(columns.length - 1, position.column + columnDelta)),
    });
  }

  function moveHorizontal(position: CellPosition, delta: number) {
    if (!rows.length || !columns.length) return;
    const currentIndex = position.row * columns.length + position.column;
    const nextIndex = Math.max(
      0,
      Math.min(rows.length * columns.length - 1, currentIndex + delta),
    );
    setSelected({
      row: Math.floor(nextIndex / columns.length),
      column: nextIndex % columns.length,
    });
  }

  function startEditing(position: CellPosition, initialDraft?: string) {
    const row = rows[position.row];
    const column = columns[position.column];
    if (!row || !column || column.readOnly || column.calculate || column.type === "checkbox" || column.type === "select") return;
    setSelected(position);
    setEditing({
      ...position,
      draft: initialDraft ?? cellString(row[column.key], column.type),
      selectOnFocus: initialDraft === undefined,
    });
  }

  function commitEditing(nextPosition?: { rowDelta: number; columnDelta: number }) {
    if (!editing) return;
    const column = columns[editing.column];
    if (!column) return;
    const value = column.type === "number"
      ? (editing.draft === "" ? "" : Number(editing.draft))
      : editing.draft;
    const position = { row: editing.row, column: editing.column };
    updateCell(editing.row, editing.column, value);
    setEditing(null);
    if (nextPosition?.columnDelta) moveHorizontal(position, nextPosition.columnDelta);
    else if (nextPosition) move(position, nextPosition.rowDelta, 0);
  }

  function handleCellKeyDown(
    event: KeyboardEvent<HTMLTableCellElement>,
    position: CellPosition,
  ) {
    const column = columns[position.column];
    if (!column) return;
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft") move(position, 0, -1);
    else if (event.key === "ArrowRight") move(position, 0, 1);
    else if (event.key === "ArrowUp") move(position, -1, 0);
    else if (event.key === "ArrowDown") move(position, 1, 0);
    else if (event.key === "Tab") moveHorizontal(position, event.shiftKey ? -1 : 1);
    else if (event.key === "Enter" || event.key === "F2") {
      if (column.type === "select" && !column.readOnly && !column.calculate) {
        cellRefs.current.get(`${position.row}:${position.column}`)?.querySelector("button")?.click();
      } else {
        startEditing(position);
      }
    }
    else if (event.key === " " && column.type === "checkbox" && !column.readOnly && !column.calculate) {
      updateCell(position.row, position.column, rows[position.row]?.[column.key] !== true);
    }
    else if ((event.key === "Backspace" || event.key === "Delete") && !column.readOnly && !column.calculate) {
      updateCell(position.row, position.column, column.type === "checkbox" ? false : "");
    } else if (
      event.key.length === 1
      && !event.ctrlKey
      && !event.metaKey
      && !event.altKey
      && !column.readOnly
      && !column.calculate
      && column.type !== "checkbox"
      && column.type !== "select"
    ) {
      startEditing(position, event.key);
    } else return;
    event.preventDefault();
  }

  function handleEditorKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      setEditing(null);
    } else if (event.key === "Enter") {
      event.preventDefault();
      commitEditing({ rowDelta: 1, columnDelta: 0 });
    } else if (event.key === "Tab") {
      event.preventDefault();
      commitEditing({ rowDelta: 0, columnDelta: event.shiftKey ? -1 : 1 });
    }
  }

  useImperativeHandle(ref, () => ({
    attemptValidation() {
      const result = validationResult(rows, columns);
      setValidationAttempted(true);
      onValidationChange?.(result);
      return result;
    },
    getRows: () => rows.map((row) => ({ ...row })),
    resetValidation() {
      setValidationAttempted(false);
      onValidationChange?.({ isValid: true, errors: [] });
    },
    resetRows(nextRows = [...initialRowsRef.current]) {
      const calculatedRows = nextRows.map((row) => applyCalculations(row, columns));
      publishRows(calculatedRows);
      setValidationAttempted(false);
      setEditing(null);
      setSelected(calculatedRows.length && columns.length ? { row: 0, column: 0 } : null);
    },
  }), [columns, onValidationChange, rows]);

  function cellIsInvalid(row: T, column: EditableGridColumn<T>) {
    if (!validationAttempted || !column.rules?.length) return false;
    return fieldHasError({
      label: column.label,
      value: cellString(row[column.key], column.type),
      rules: [...column.rules],
    });
  }

  function addRow() {
    if (!createRow) return;
    const nextRows = [...rows, applyCalculations(createRow(rows), columns)];
    publishRows(nextRows);
    setSelected({ row: nextRows.length - 1, column: 0 });
  }

  function deleteRow(rowIndex: number) {
    const nextRows = rows.filter((_, index) => index !== rowIndex);
    publishRows(nextRows);
    setEditing(null);
    setSelected(nextRows.length && columns.length
      ? { row: Math.min(rowIndex, nextRows.length - 1), column: selected?.column ?? 0 }
      : null);
  }

  return (
    <div className={[styles.root, className ?? ""].filter(Boolean).join(" ")}>
      <div className={styles.scrollArea}>
        <table className={styles.grid} role="grid" aria-label={ariaLabel}>
          <colgroup>
            <col className={styles.rowNumberColumn} />
            {columns.map((column) => <col key={column.key} style={{ width: column.width }} />)}
            {allowDeleteRows && <col className={styles.actionColumn} />}
          </colgroup>
          <thead>
            <tr>
              <th className={styles.corner} aria-label="Row number" />
              {columns.map((column) => (
                <th key={column.key} className={styles.headerCell} scope="col">
                  <span>{column.label}</span>
                  {(column.readOnly || column.calculate) && (
                    <span className={`material-symbols-outlined ${styles.headerIcon}`} title={column.calculate ? "Calculated" : "Read only"}>
                      {column.calculate ? "calculate" : "lock"}
                    </span>
                  )}
                </th>
              ))}
              {allowDeleteRows && <th className={styles.corner} aria-label="Row actions" />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td className={styles.emptyCell} colSpan={columns.length + 1 + (allowDeleteRows ? 1 : 0)}>{emptyText}</td></tr>
            ) : rows.map((row, rowIndex) => (
              <tr key={row.id}>
                <th className={styles.rowNumber} scope="row">{rowIndex + 1}</th>
                {columns.map((column, columnIndex) => {
                  const position = { row: rowIndex, column: columnIndex };
                  const isSelected = selected?.row === rowIndex && selected.column === columnIndex;
                  const isEditing = editing?.row === rowIndex && editing.column === columnIndex;
                  const isReadOnly = column.readOnly || Boolean(column.calculate);
                  const isInvalid = cellIsInvalid(row, column);
                  return (
                    <td
                      key={column.key}
                      ref={(node) => {
                        const key = `${rowIndex}:${columnIndex}`;
                        if (node) cellRefs.current.set(key, node);
                        else cellRefs.current.delete(key);
                      }}
                      role="gridcell"
                      aria-colindex={columnIndex + 1}
                      aria-rowindex={rowIndex + 1}
                      aria-readonly={isReadOnly || undefined}
                      aria-invalid={isInvalid || undefined}
                      tabIndex={isSelected ? 0 : -1}
                      className={[
                        styles.cell,
                        isSelected ? styles.selected : "",
                        isReadOnly ? styles.readOnly : "",
                        isInvalid ? styles.invalid : "",
                      ].filter(Boolean).join(" ")}
                      style={{ textAlign: column.align ?? (column.type === "number" ? "right" : "left") }}
                      onClick={() => setSelected(position)}
                      onDoubleClick={() => startEditing(position)}
                      onKeyDown={(event) => handleCellKeyDown(event, position)}
                    >
                      {column.type === "checkbox" ? (
                        <input
                          type="checkbox"
                          checked={row[column.key] === true}
                          disabled={isReadOnly}
                          aria-label={`${column.label}, row ${rowIndex + 1}`}
                          onChange={(event) => updateCell(rowIndex, columnIndex, event.target.checked)}
                          onFocus={() => setSelected(position)}
                        />
                      ) : column.type === "select" && isSelected && !isReadOnly ? (
                        <div className={styles.selectCellControl}>
                          <SearchableSelect
                            value={cellString(row[column.key], column.type)}
                            onChange={(value) => updateCell(rowIndex, columnIndex, value)}
                            options={[...(column.options ?? [])]}
                            searchable={column.searchable ?? true}
                            placeholder={column.placeholder ?? "Select..."}
                            searchPlaceholder={column.searchPlaceholder ?? "Search..."}
                            hasError={isInvalid}
                            codeBadge={false}
                            gridStyling
                            className={styles.selectEditor}
                          />
                        </div>
                      ) : isEditing ? (
                        <input
                          ref={editRef as RefObject<HTMLInputElement>}
                          className={styles.editor}
                          type={column.type === "number" ? "text" : column.type}
                          inputMode={column.type === "number" ? "decimal" : undefined}
                          value={editing.draft}
                          onChange={(event) => {
                            const draft = event.target.value;
                            if (
                              column.type !== "number" ||
                              /^-?(?:\d+)?(?:\.\d*)?$/.test(draft)
                            ) {
                              setEditing({ ...editing, draft });
                            }
                          }}
                          onBlur={() => commitEditing()}
                          onKeyDown={handleEditorKeyDown}
                        />
                      ) : (
                        <span className={styles.cellValue}>{displayValue(row, column)}</span>
                      )}
                    </td>
                  );
                })}
                {allowDeleteRows && (
                  <td className={styles.actionCell}>
                    <button type="button" className={styles.deleteButton} aria-label={`Delete row ${rowIndex + 1}`} onClick={() => deleteRow(rowIndex)}>
                      <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {allowAddRows && (
        <div className={styles.footer}>
          <button type="button" className={styles.addButton} disabled={!createRow} onClick={addRow}>
            <span className="material-symbols-outlined" aria-hidden="true">add</span>
            {addRowLabel}
          </button>
        </div>
      )}
    </div>
  );
}

export const EditableGrid = forwardRef(EditableGridInner) as <T extends EditableGridRow>(
  props: EditableGridProps<T> & RefAttributes<EditableGridHandle<T>>,
) => ReactElement;
