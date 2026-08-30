"use client";

import { useRef, useState } from "react";
import {
  Button,
  EditableGrid,
  ValidationAlert,
  maxLength,
  required,
} from "@voyzu/ui-components";
import type {
  EditableGridColumn,
  EditableGridHandle,
  EditableGridValidationResult,
} from "@voyzu/ui-components";
import styles from "./editable-grid-previews.module.css";

type InventoryRow = {
  id: number;
  item: string;
  quantity: number | "";
  supplierCountry: string;
  category: string;
  taxable: boolean;
};

const CATEGORY_OPTIONS = [
  { value: "office", label: "Office" },
  { value: "hardware", label: "Hardware" },
  { value: "software", label: "Software" },
] as const;

const COUNTRY_OPTIONS = [
  { value: "au", label: "Australia" },
  { value: "ca", label: "Canada" },
  { value: "fr", label: "France" },
  { value: "de", label: "Germany" },
  { value: "in", label: "India" },
  { value: "jp", label: "Japan" },
  { value: "nz", label: "New Zealand" },
  { value: "sg", label: "Singapore" },
  { value: "za", label: "South Africa" },
  { value: "gb", label: "United Kingdom" },
  { value: "us", label: "United States" },
] as const;

const TYPE_COLUMNS: EditableGridColumn<InventoryRow>[] = [
  { key: "item", label: "Text", type: "text", width: 160 },
  { key: "quantity", label: "Number", type: "number", width: 90 },
  {
    key: "supplierCountry",
    label: "Searchable",
    type: "select",
    width: 150,
    options: COUNTRY_OPTIONS,
    searchPlaceholder: "Search countries...",
  },
  { key: "category", label: "Non-searchable", type: "select", width: 150, options: CATEGORY_OPTIONS, searchable: false },
  { key: "taxable", label: "Checkbox", type: "checkbox", width: 90, align: "center" },
];

const TYPE_ROWS: InventoryRow[] = [
  { id: 1, item: "Printer paper", quantity: 12, supplierCountry: "nz", category: "office", taxable: true },
  { id: 2, item: "USB-C dock", quantity: 4, supplierCountry: "au", category: "hardware", taxable: true },
  { id: 3, item: "Editor licence", quantity: 25, supplierCountry: "us", category: "software", taxable: false },
];

export function EditableGridCellTypesPreview() {
  return <EditableGrid columns={TYPE_COLUMNS} initialRows={TYPE_ROWS} ariaLabel="Supported editable cell types" />;
}

type ValidatedRow = {
  id: number;
  description: string;
  quantity: number | "";
  category: string;
  approved: boolean;
};

const VALIDATED_COLUMNS: EditableGridColumn<ValidatedRow>[] = [
  {
    key: "description",
    label: "Description",
    type: "text",
    width: 220,
    rules: [required(), maxLength(24, "Description must be 24 characters or less")],
  },
  {
    key: "quantity",
    label: "Quantity",
    type: "number",
    width: 120,
    rules: [
      required(),
      { kind: "format", test: (value) => Number(value) > 0, message: "Quantity must be greater than zero" },
    ],
  },
  { key: "category", label: "Category", type: "select", width: 160, options: CATEGORY_OPTIONS, rules: [required()] },
  { key: "approved", label: "Approved", type: "checkbox", width: 110, align: "center", rules: [required()] },
];

export function EditableGridValidationPreview() {
  const gridRef = useRef<EditableGridHandle<ValidatedRow>>(null);
  const [result, setResult] = useState<EditableGridValidationResult>({ isValid: true, errors: [] });
  const [dismissed, setDismissed] = useState(false);
  const [saved, setSaved] = useState(false);

  function validate() {
    const next = gridRef.current?.attemptValidation();
    if (!next) return;
    setResult(next);
    setDismissed(false);
    setSaved(next.isValid);
  }

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <ValidationAlert errors={result.errors} visible={!result.isValid && !dismissed} onDismiss={() => setDismissed(true)} />
      <EditableGrid
        ref={gridRef}
        columns={VALIDATED_COLUMNS}
        initialRows={[
          { id: 1, description: "", quantity: 0, category: "office", approved: false },
          { id: 2, description: "A description that is deliberately too long", quantity: 2, category: "hardware", approved: true },
        ]}
        onValidationChange={(next) => {
          setResult(next);
          setDismissed(false);
          if (!next.isValid) setSaved(false);
        }}
        ariaLabel="Grid validation example"
      />
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Button variant="primary" onClick={validate}>Validate grid</Button>
        {saved && <span style={{ color: "var(--voyzu-color-success-text)", fontSize: "0.875rem", fontWeight: 600 }}>Valid — ready to save</span>}
      </div>
    </div>
  );
}

type ReadOnlyRow = {
  id: number;
  code: string;
  description: string;
  active: boolean;
};

export function EditableGridReadOnlyPreview() {
  const columns: EditableGridColumn<ReadOnlyRow>[] = [
    { key: "code", label: "System code", type: "text", width: 150, readOnly: true },
    { key: "description", label: "Editable description", type: "text", width: 260 },
    { key: "active", label: "Locked status", type: "checkbox", width: 130, align: "center", readOnly: true },
  ];
  return (
    <EditableGrid
      columns={columns}
      initialRows={[
        { id: 1, code: "ITEM-001", description: "Standard support", active: true },
        { id: 2, code: "ITEM-002", description: "Priority support", active: false },
      ]}
      ariaLabel="Read-only columns example"
    />
  );
}

type CalculationRow = {
  id: number;
  item: string;
  quantity: number | "";
  unitPrice: number | "";
  total: number;
};

const CALCULATION_COLUMNS: EditableGridColumn<CalculationRow>[] = [
  { key: "item", label: "Item", type: "text", width: 200 },
  { key: "quantity", label: "Quantity", type: "number", width: 110 },
  { key: "unitPrice", label: "Unit price", type: "number", width: 130 },
  {
    key: "total",
    label: "Total",
    type: "number",
    width: 140,
    calculate: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0),
    format: (value) => `$${Number(value).toFixed(2)}`,
  },
];

export function EditableGridCalculatedPreview() {
  return (
    <EditableGrid
      columns={CALCULATION_COLUMNS}
      initialRows={[
        { id: 1, item: "Consulting", quantity: 8, unitPrice: 180, total: 0 },
        { id: 2, item: "Travel", quantity: 3, unitPrice: 75.5, total: 0 },
      ]}
      ariaLabel="Calculated columns example"
    />
  );
}

type TypographyRow = {
  id: number;
  reference: string;
  item: string;
  variance: number;
  note: string;
};

const TYPOGRAPHY_COLUMNS: EditableGridColumn<TypographyRow>[] = [
  { key: "reference", label: "Reference", type: "text", readOnly: true, width: 150, valueClassName: styles.monospace },
  { key: "item", label: "Item", type: "text", readOnly: true, width: 220, valueClassName: styles.strong },
  { key: "variance", label: "Variance", type: "number", readOnly: true, width: 110, valueClassName: styles.dangerStrong },
  { key: "note", label: "Note", type: "text", readOnly: true, width: 220, valueClassName: styles.mutedItalic },
];

export function EditableGridTypographyPreview() {
  return (
    <EditableGrid
      columns={TYPOGRAPHY_COLUMNS}
      initialRows={[
        { id: 1, reference: "COUNT-000042", item: "Premium Coffee Beans", variance: -8, note: "Recount required" },
        { id: 2, reference: "COUNT-000043", item: "Gift Shipping Box", variance: 3, note: "Packaging adjustment" },
      ]}
      ariaLabel="Custom value typography example"
    />
  );
}

type MutableRow = {
  id: number;
  task: string;
  owner: string;
  complete: boolean;
};

const MUTABLE_COLUMNS: EditableGridColumn<MutableRow>[] = [
  { key: "task", label: "Task", type: "text", width: 220 },
  {
    key: "owner",
    label: "Owner",
    type: "select",
    width: 150,
    options: [
      { value: "Alex", label: "Alex" },
      { value: "Morgan", label: "Morgan" },
      { value: "Sam", label: "Sam" },
    ],
  },
  { key: "complete", label: "Complete", type: "checkbox", width: 110, align: "center" },
];

export function EditableGridRowsAndStatePreview() {
  const [rows, setRows] = useState<MutableRow[]>([
    { id: 1, task: "Review draft", owner: "Alex", complete: false },
    { id: 2, task: "Publish release", owner: "Morgan", complete: false },
  ]);
  const nextId = useRef(3);

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <EditableGrid
        columns={MUTABLE_COLUMNS}
        initialRows={rows}
        allowAddRows
        allowDeleteRows
        createRow={() => ({ id: nextId.current++, task: "", owner: "Alex", complete: false })}
        onRowsChange={setRows}
        addRowLabel="Add task"
        ariaLabel="Row management example"
      />
      <details>
        <summary style={{ cursor: "pointer", color: "var(--voyzu-color-link)", fontSize: "0.8125rem" }}>Inspect current rows</summary>
        <pre style={{ overflow: "auto", margin: "0.5rem 0 0", padding: "0.75rem", borderRadius: 6, background: "var(--voyzu-color-surface-muted)", fontSize: "0.75rem" }}>
          {JSON.stringify(rows, null, 2)}
        </pre>
      </details>
    </div>
  );
}
