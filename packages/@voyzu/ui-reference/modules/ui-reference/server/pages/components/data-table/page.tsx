import { getSingletonHighlighter } from "shiki";
import {
  DataTableStandardPreview,
  DataTableSingleSelectPreview,
  DataTableNoSelectionPreview,
  DataTableEmptyPreview,
} from "./data-table-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Standard table with multi-select",
    description: "The typical setup: multi-select checkboxes, pagination, row click handler, and a trailing spacer column to prevent column stretching.",
    preview: <DataTableStandardPreview />,
    code: `type Invoice = { id: number; number: string; customer: string; amount: string; hasPostings: boolean; status: string; date: string };

const COLUMNS: DataTableColumn<Invoice>[] = [
  { key: "number",   label: "Invoice",  width: 140 },
  { key: "customer", label: "Customer", width: 160 },
  { key: "amount",   label: "Amount",   width: 130, align: "right" },
  { key: "hasPostings", label: "Has Postings", width: 110, align: "center",
    render: (row) => row.hasPostings
      ? <span className="material-symbols-outlined" aria-label="Has postings">check</span>
      : "-" },
  { key: "status",   label: "Status",   width: 110,
    render: (row) => <span style={{ color: STATUS_COLOURS[row.status] }}>{row.status}</span> },
  { key: "date",     label: "Date",     width: 120 },
  { key: "_spacer",  label: "",         render: () => null },  // absorbs remaining width
];

const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

const onSelectAll = () =>
  setSelectedIds((prev) => prev.size === rows.length ? new Set<number>() : new Set(rows.map((r) => r.id)));

const onSelectOne = (id: number) =>
  setSelectedIds((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

<DataTable
  columns={COLUMNS}
  rows={rows}
  selectedIds={selectedIds}
  isAllSelected={selectedIds.size === rows.length}
  isSomeSelected={selectedIds.size > 0 && selectedIds.size < rows.length}
  onSelectAll={onSelectAll}
  onSelectOne={onSelectOne}
  onRowClick={(row) => router.push(\`/invoices/\${row.id}\`)}
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  totalCount={totalCount}
  filteredCount={rows.length}
  itemLabel="invoices"
  hasData={totalCount > 0}
  emptyIcon="receipt_long"
  emptyTitle="No invoices"
  emptyText="Create your first invoice to get started"
/>`,
  },
  {
    name: "Single select",
    description: "Pass singleSelect to replace the checkboxes with radio buttons — selecting one automatically deselects the previous row.",
    preview: <DataTableSingleSelectPreview />,
    code: `const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

<DataTable
  {...commonProps}
  selectedIds={selectedIds}
  isAllSelected={false}
  isSomeSelected={false}
  onSelectAll={() => {}}
  onSelectOne={(id) => setSelectedIds(new Set([id]))}
  singleSelect
/>`,
  },
  {
    name: "No selection column",
    description: "Pass noSelectionColumn to remove the checkbox column entirely — useful for display-only tables or when selection is handled externally.",
    preview: <DataTableNoSelectionPreview />,
    code: `<DataTable
  {...commonProps}
  selectedIds={new Set<number>()}
  isAllSelected={false}
  isSomeSelected={false}
  onSelectAll={() => {}}
  onSelectOne={() => {}}
  noSelectionColumn
/>`,
  },
  {
    name: "Empty state",
    description: "When rows is empty and hasData is false, the table shows the empty state with icon and descriptive text. When hasData is true but rows is empty (filtered), it shows the filter empty state instead.",
    preview: <DataTableEmptyPreview />,
    code: `<DataTable
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
/>`,
  },
];

const PROP_TABLE = [
  { name: "columns", type: "DataTableColumn<T>[]", required: "✓", description: "Column definitions — key, label, width, align, render, hideOnTablet" },
  { name: "rows", type: "T[]", required: "✓", description: "Data rows. T must have an id field of type number | string" },
  { name: "selectedIds", type: "Set<Id>", required: "✓", description: "Currently selected row IDs" },
  { name: "isAllSelected", type: "boolean", required: "✓", description: "True when all rows are selected (drives the header checkbox)" },
  { name: "isSomeSelected", type: "boolean", required: "✓", description: "True when some (not all) rows are selected (drives indeterminate state)" },
  { name: "onSelectAll", type: "() => void", required: "✓", description: "Toggle all rows on/off" },
  { name: "onSelectOne", type: "(id: Id) => void", required: "✓", description: "Toggle a single row" },
  { name: "onRowClick", type: "(row: T) => void", required: "", description: "Optional row click handler — typically navigates to the detail page" },
  { name: "noSelectionColumn", type: "boolean", required: "", description: "Hides the checkbox/radio column entirely" },
  { name: "singleSelect", type: "boolean", required: "", description: "Replaces checkboxes with radio buttons" },
  { name: "currentPage", type: "number", required: "✓", description: "Current page number (1-based)" },
  { name: "totalPages", type: "number", required: "✓", description: "Total number of pages" },
  { name: "onPageChange", type: "(page: number) => void", required: "✓", description: "Called when the user navigates to a different page" },
  { name: "totalCount", type: "number | string", required: "✓", description: "Total record count across all pages (shown in footer)" },
  { name: "filteredCount", type: "number", required: "✓", description: "Count of currently visible rows (shown in footer)" },
  { name: "itemLabel", type: "string", required: "✓", description: 'Noun for the record type — e.g. "invoices", "contacts"' },
  { name: "hasData", type: "boolean", required: "✓", description: "True if records exist in the database (used to choose the correct empty state)" },
  { name: "loading", type: "boolean", required: "", description: "Shows a loading spinner when true" },
  { name: "emptyIcon", type: "string", required: "", description: "Material symbol name for the no-data empty state" },
  { name: "emptyTitle", type: "string", required: "", description: "Heading for the no-data empty state" },
  { name: "emptyText", type: "string", required: "", description: "Body text for the no-data empty state" },
  { name: "emptyFilterText", type: "string", required: "", description: "Body text for the filtered-but-empty state" },
  { name: "mobileRender", type: "(row: T) => ReactNode", required: "", description: "Custom mobile card renderer (shown when viewport is mobile-width)" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Data Table</h1>
        <p className={pageStyles.description}>
          A full-featured data table with multi-select, pagination, empty states, and responsive mobile layout.
          Uses <code>table-layout: fixed</code> — always set explicit widths on data columns and add a trailing spacer column.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ DataTable }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Props</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {PROP_TABLE.map((p) => (
                <tr key={p.name}>
                  <td><code className={pageStyles.propName}>{p.name}</code></td>
                  <td><code className={pageStyles.propType}>{p.type}</code></td>
                  <td className={pageStyles.propRequired}>{p.required}</td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {STORIES.map((story, i) => (
        <section key={story.name} className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>{story.name}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
            {story.description}
          </p>
          <div style={{ marginBottom: "1.25rem" }}>
            {story.preview}
          </div>
          <div className={pageStyles.story}>
            <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtmls[i]! }} />
          </div>
        </section>
      ))}
    </main>
  );
}
