import { getSingletonHighlighter } from "shiki";
import pageStyles from "../../page.module.css";
import {
  EditableGridCalculatedPreview,
  EditableGridCellTypesPreview,
  EditableGridReadOnlyPreview,
  EditableGridRowsAndStatePreview,
  EditableGridTypographyPreview,
  EditableGridValidationPreview,
} from "./editable-grid-previews";

async function highlight(code: string) {
  const highlighter = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return highlighter.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Cell types and keyboard editing",
    description: "Text, number, select, and checkbox columns. Click a cell to select it; double-click, type, Enter, or F2 to edit.",
    preview: <EditableGridCellTypesPreview />,
    code: `type Row = {
  id: number;
  item: string;
  quantity: number | "";
  supplierCountry: string;
  category: string;
  taxable: boolean;
};

const columns: EditableGridColumn<Row>[] = [
  { key: "item", label: "Text", type: "text", width: 160 },
  { key: "quantity", label: "Number", type: "number", width: 90 },
  { key: "supplierCountry", label: "Searchable", type: "select",
    options: COUNTRY_OPTIONS, searchPlaceholder: "Search countries..." },
  { key: "category", label: "Non-searchable", type: "select", searchable: false, options: [
    { value: "office", label: "Office" },
    { value: "hardware", label: "Hardware" },
  ]},
  { key: "taxable", label: "Checkbox", type: "checkbox", align: "center" },
];

<EditableGrid columns={columns} initialRows={rows} />`,
  },
  {
    name: "Validation",
    description: "Rules belong to columns and therefore apply consistently to every cell in that column. Validation is shown only after an explicit attempt and updates as cells are corrected.",
    preview: <EditableGridValidationPreview />,
    code: `const gridRef = useRef<EditableGridHandle<Row>>(null);
const [validation, setValidation] = useState({ isValid: true, errors: [] });

const columns: EditableGridColumn<Row>[] = [
  { key: "description", label: "Description", type: "text",
    rules: [required(), maxLength(24)] },
  { key: "quantity", label: "Quantity", type: "number", rules: [
    required(),
    { kind: "format", test: (value) => Number(value) > 0,
      message: "Quantity must be greater than zero" },
  ]},
];

<ValidationAlert errors={validation.errors} visible={!validation.isValid} />
<EditableGrid
  ref={gridRef}
  columns={columns}
  initialRows={rows}
  onValidationChange={setValidation}
/>
<Button variant="primary" onClick={() => gridRef.current?.attemptValidation()}>
  Validate grid
</Button>`,
  },
  {
    name: "Read-only columns",
    description: "Set readOnly on a column to keep all its cells selectable and copyable but unavailable for editing. Locked headers and cells have a muted treatment.",
    preview: <EditableGridReadOnlyPreview />,
    code: `const columns: EditableGridColumn<Row>[] = [
  { key: "code", label: "System code", type: "text", readOnly: true },
  { key: "description", label: "Editable description", type: "text" },
  { key: "active", label: "Locked status", type: "checkbox", readOnly: true },
];`,
  },
  {
    name: "Calculated columns",
    description: "A calculate function receives the current row after each edit. Calculated columns are always read-only; calculations run in column order so later calculations may depend on earlier ones.",
    preview: <EditableGridCalculatedPreview />,
    code: `const columns: EditableGridColumn<Row>[] = [
  { key: "quantity", label: "Quantity", type: "number" },
  { key: "unitPrice", label: "Unit price", type: "number" },
  {
    key: "total",
    label: "Total",
    type: "number",
    calculate: (row) => Number(row.quantity || 0) * Number(row.unitPrice || 0),
    format: (value) => "$" + Number(value).toFixed(2),
  },
];`,
  },
  {
    name: "Value typography and emphasis",
    description: "Use valueClassName to apply a CSS class to displayed cell values. It accepts either a class name or a function of the value and row, enabling semantic emphasis without changing stored data.",
    preview: <EditableGridTypographyPreview />,
    code: `import styles from "./stocktake.module.css";

const columns: EditableGridColumn<Row>[] = [
  {
    key: "reference",
    label: "Reference",
    type: "text",
    readOnly: true,
    valueClassName: styles.monospace,
  },
  {
    key: "variance",
    label: "Variance",
    type: "number",
    readOnly: true,
    valueClassName: styles.dangerStrong,
  },
  {
    key: "status",
    label: "Status",
    type: "text",
    readOnly: true,
    valueClassName: (value) =>
      value === "Exception" ? styles.dangerStrong : styles.muted,
  },
];

// stocktake.module.css
.dangerStrong {
  color: var(--voyzu-color-danger-text);
  font-weight: 700;
}

.monospace {
  font-family: ui-monospace, "Cascadia Code", Menlo, Consolas, monospace;
}`,
  },
  {
    name: "Adding, deleting, and observing state",
    description: "Row controls are opt-in. The grid owns its working copy; onRowsChange provides snapshots for surrounding UI, while getRows returns the current snapshot on demand.",
    preview: <EditableGridRowsAndStatePreview />,
    code: `const gridRef = useRef<EditableGridHandle<Row>>(null);
const nextId = useRef(3);

<EditableGrid
  ref={gridRef}
  columns={columns}
  initialRows={initialRows}
  allowAddRows
  allowDeleteRows
  createRow={() => ({ id: nextId.current++, task: "", owner: "Alex", complete: false })}
  onRowsChange={(rows) => console.log(rows)}
/>

const rowsToSave = gridRef.current?.getRows();`,
  },
];

const PROPS = [
  { name: "columns", type: "readonly EditableGridColumn<T>[]", required: "✓", description: "Column definitions shared by every row." },
  { name: "initialRows", type: "readonly T[]", required: "✓", description: "Initial data copied into internal grid state. Each row requires a unique string or number id." },
  { name: "onRowsChange", type: "(rows: T[]) => void", required: "", description: "Receives a complete calculated snapshot after an edit, addition, deletion, or reset." },
  { name: "onValidationChange", type: "(result) => void", required: "", description: "Receives validation results after an attempt and whenever attempted data changes." },
  { name: "allowAddRows", type: "boolean", required: "", description: "Shows the add-row footer control. Defaults to false." },
  { name: "allowDeleteRows", type: "boolean", required: "", description: "Shows a delete action for every row. Defaults to false." },
  { name: "createRow", type: "(rows: readonly T[]) => T", required: "", description: "Creates a row with a unique id. Required for an enabled add-row control." },
  { name: "addRowLabel", type: "string", required: "", description: "Add-row control text. Defaults to “Add row”." },
  { name: "emptyText", type: "string", required: "", description: "Message shown when the grid has no rows." },
  { name: "ariaLabel", type: "string", required: "", description: "Accessible grid label. Defaults to “Editable grid”." },
  { name: "className", type: "string", required: "", description: "Additional class applied to the grid container." },
];

const COLUMN_PROPS = [
  { name: "key", type: "keyof T", required: "✓", description: "Row property read and updated by the column." },
  { name: "label", type: "string", required: "✓", description: "Header and validation label." },
  { name: "type", type: '"text" | "number" | "select" | "checkbox"', required: "✓", description: "One consistent editor and value type for the whole column." },
  { name: "width", type: "number | string", required: "", description: "Column width. Numeric values are pixels." },
  { name: "align", type: '"left" | "center" | "right"', required: "", description: "Cell alignment. Number columns default to right." },
  { name: "readOnly", type: "boolean", required: "", description: "Prevents editing for all cells in the column." },
  { name: "options", type: "readonly { value; label }[]", required: "", description: "Options for select columns." },
  { name: "searchable", type: "boolean", required: "", description: "Enables filtering in the shared SearchableSelect editor. Defaults to true." },
  { name: "placeholder", type: "string", required: "", description: "Empty-value text for a select column." },
  { name: "searchPlaceholder", type: "string", required: "", description: "Search field placeholder for a searchable select column." },
  { name: "rules", type: "readonly FieldRule[]", required: "", description: "Existing required, pattern, minLength, maxLength, or custom validation rules." },
  { name: "calculate", type: "(row: Readonly<T>) => T[keyof T]", required: "", description: "Computes the column after initialization and every row edit. Implies read-only." },
  { name: "format", type: "(value, row) => string", required: "", description: "Formats display text without changing the stored value." },
  { name: "valueClassName", type: "string | ((value, row) => string | undefined)", required: "", description: "CSS class applied to the displayed value. Use a callback for conditional semantic or typographic styling. It does not change the editor or stored value." },
];

const METHODS = [
  { name: "attemptValidation()", description: "Shows invalid cells, reports errors, and returns { isValid, errors }." },
  { name: "getRows()", description: "Returns a shallow-cloned snapshot of current rows, including calculated values." },
  { name: "resetValidation()", description: "Clears the attempted validation state and reported errors." },
  { name: "resetRows(rows?)", description: "Replaces working data, or restores initial rows when omitted." },
];

const KEYS = [
  ["Arrow keys", "Move the selected cell."],
  ["Tab / Shift+Tab", "Move horizontally, wrapping between rows."],
  ["Enter or F2", "Edit the selected text, number, or select cell."],
  ["Typing", "Replace the selected editable cell and begin editing."],
  ["Enter while editing", "Commit and move down."],
  ["Tab while editing", "Commit and move horizontally."],
  ["Escape", "Cancel the current edit."],
  ["Space", "Toggle an editable checkbox cell."],
  ["Delete / Backspace", "Clear the selected editable cell."],
];

function ReferenceTable({ rows }: { rows: { name: string; type?: string; required?: string; description: string }[] }) {
  return (
    <div className={pageStyles.tableWrap}>
      <table className={pageStyles.propsTable}>
        <thead><tr><th>Name</th>{rows.some((row) => row.type) && <th>Type</th>}{rows.some((row) => row.required !== undefined) && <th>Required</th>}<th>Description</th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.name}><td><code className={pageStyles.propName}>{row.name}</code></td>{rows.some((item) => item.type) && <td><code className={pageStyles.propType}>{row.type}</code></td>}{rows.some((item) => item.required !== undefined) && <td className={pageStyles.propRequired}>{row.required}</td>}<td>{row.description}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export default async function Page() {
  const codeHtml = await Promise.all(STORIES.map((story) => highlight(story.code)));
  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Editable Grid</h1>
        <p className={pageStyles.description}>An internally stateful, spreadsheet-style grid for editing consistently typed columns. It supports keyboard editing, column validation, read-only data, row-local calculations, and optional row management without automatic persistence.</p>
        <div className={pageStyles.importBlock}><code>import {"{ EditableGrid }"} from &quot;@voyzu/ui-components&quot;</code></div>
      </div>

      <section className={pageStyles.section}><h2 className={pageStyles.sectionTitle}>Component props</h2><ReferenceTable rows={PROPS} /></section>
      <section className={pageStyles.section}><h2 className={pageStyles.sectionTitle}>Column definition</h2><ReferenceTable rows={COLUMN_PROPS} /></section>
      <section className={pageStyles.section}><h2 className={pageStyles.sectionTitle}>Imperative methods</h2><ReferenceTable rows={METHODS} /></section>
      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Keyboard interaction</h2>
        <div className={pageStyles.tableWrap}><table className={pageStyles.propsTable}><thead><tr><th>Key</th><th>Behavior</th></tr></thead><tbody>{KEYS.map(([key, behavior]) => <tr key={key}><td><code className={pageStyles.propName}>{key}</code></td><td>{behavior}</td></tr>)}</tbody></table></div>
      </section>

      {STORIES.map((story, index) => (
        <section key={story.name} className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>{story.name}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>{story.description}</p>
          <div style={{ marginBottom: "1.25rem" }}>{story.preview}</div>
          <div className={pageStyles.story}><div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtml[index]! }} /></div>
        </section>
      ))}
    </main>
  );
}
