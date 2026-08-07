import { getSingletonHighlighter } from "shiki";
import { FilterPanelCheckboxPreview, FilterPanelCombinedPreview } from "./filter-panel-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Checkbox filters",
    description: "Click Filter to open the panel. Select options and click Apply. Active filters render as dismissible chips.",
    preview: <FilterPanelCheckboxPreview />,
    code: `const TABS: FilterTab[] = [
  { key: "status", label: "Status", type: "checkbox",
    options: ["Paid", "Pending", "Overdue", "Draft"] },
];

function emptyState(tabs: FilterTab[]): FilterState {
  const state: FilterState = {};
  for (const tab of tabs) {
    state[tab.key] = tab.type === "checkbox" ? [] : { start: "", end: "" };
  }
  return state;
}

const [filters, setFilters] = useState<FilterState>(emptyState(TABS));

<FilterPanel
  tabs={TABS}
  filters={filters}
  onApply={setFilters}
  onClear={() => setFilters(emptyState(TABS))}
  onRemoveFilter={(key) => setFilters((prev) => ({ ...prev, [key]: [] }))}
/>`,
  },
  {
    name: "Multiple tabs with date range",
    description: "Combine checkbox and daterange tabs in one panel. The date tab shows a two-field date range picker. Starts with a chip pre-applied to demonstrate the chip strip.",
    preview: <FilterPanelCombinedPreview />,
    code: `const TABS: FilterTab[] = [
  { key: "status", label: "Status", type: "checkbox",
    options: ["Paid", "Pending", "Overdue", "Draft"] },
  { key: "type", label: "Type", type: "checkbox",
    options: ["Sales Invoice", "Credit Note", "Prepayment", "Overpayment"] },
  { key: "date", label: "Invoice Date", panelTitle: "Filter by date range", type: "daterange" },
];

const [filters, setFilters] = useState<FilterState>({
  status: ["Paid"],
  type: [],
  date: { start: "", end: "" },
});

<FilterPanel
  tabs={TABS}
  filters={filters}
  onApply={setFilters}
  onClear={() => setFilters(emptyState(TABS))}
  onRemoveFilter={(key) => {
    const tab = TABS.find((t) => t.key === key);
    setFilters((prev) => ({
      ...prev,
      [key]: tab?.type === "daterange" ? { start: "", end: "" } : [],
    }));
  }}
/>`,
  },
];

const PROP_TABLE = [
  { name: "tabs", type: "FilterTab[]", required: "✓", description: "Filter tab definitions — each is either a checkbox or daterange tab" },
  { name: "filters", type: "FilterState", required: "✓", description: "Current filter values — a Record keyed by tab.key" },
  { name: "onApply", type: "(filters: FilterState) => void", required: "✓", description: "Called with the new filter state when the user clicks Apply" },
  { name: "onClear", type: "() => void", required: "✓", description: "Called when the user clicks Clear all" },
  { name: "onRemoveFilter", type: "(key: string) => void", required: "✓", description: "Called when a chip's × button is clicked — clear that tab's value" },
  { name: "showChips", type: "boolean", required: "", description: "Whether to render active filter chips (default: true)" },
  { name: "reversed", type: "boolean", required: "", description: "Opens the dropdown leftward — useful when the button is right-aligned" },
];

const TYPE_TABLE = [
  { name: "FilterCheckboxTab", fields: "key, label, type: \"checkbox\", options: string[], panelTitle?" },
  { name: "FilterDateRangeTab", fields: "key, label, type: \"daterange\", panelTitle?" },
  { name: "FilterState", fields: "Record<string, CheckboxFilterValue | DateRangeFilterValue>" },
  { name: "CheckboxFilterValue", fields: "string[]" },
  { name: "DateRangeFilterValue", fields: "{ start: string; end: string }" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Filter Panel</h1>
        <p className={pageStyles.description}>
          A dropdown filter panel with sidebar tab navigation, checkbox lists, date range pickers, and active filter chips.
          Typically placed in the toolbar row of a list screen alongside the search input.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ FilterPanel }"} from &quot;@voyzu/ui-components&quot;</code>
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

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Types</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Fields / Value</th>
              </tr>
            </thead>
            <tbody>
              {TYPE_TABLE.map((t) => (
                <tr key={t.name}>
                  <td><code className={pageStyles.propName}>{t.name}</code></td>
                  <td><code className={pageStyles.propType}>{t.fields}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {STORIES.map((story, i) => (
        <section key={story.name} className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>{story.name}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            {story.description}
          </p>

          {/* Control lives directly on the page — no clipping box */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {story.preview}
          </div>

          {/* Code block in its own card */}
          <div className={pageStyles.story}>
            <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtmls[i]! }} />
          </div>
        </section>
      ))}
    </main>
  );
}
