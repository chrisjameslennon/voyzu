import { getSingletonHighlighter } from "shiki";
import {
  SearchableSelectBasicPreview,
  SearchableSelectNonSearchablePreview,
  SearchableSelectCodeBadgePreview,
  SearchableSelectClearablePreview,
  SearchableSelectErrorPreview,
  SearchableSelectDisabledPreview,
  SearchableSelectMultiNonSearchablePreview,
  SearchableSelectMultiPreview,
} from "./searchable-select-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Searchable",
    description: "The default mode. A search input appears in the dropdown for filtering a long list. Ideal for lists of 8 or more items.",
    preview: <SearchableSelectBasicPreview />,
    code: `const [value, setValue] = useState("");

const COUNTRIES = [
  { value: "au", label: "Australia" },
  { value: "nz", label: "New Zealand" },
  { value: "gb", label: "United Kingdom" },
  // ...
];

<SearchableSelect
  value={value}
  onChange={setValue}
  options={COUNTRIES}
  placeholder="Select a country…"
  searchPlaceholder="Search countries…"
/>`,
  },
  {
    name: "Non-searchable",
    description: "Pass searchable={false} to hide the search input. Use this for short, fixed lists where scanning is trivial.",
    preview: <SearchableSelectNonSearchablePreview />,
    code: `<SearchableSelect
  value={value}
  onChange={setValue}
  options={CURRENCIES}
  placeholder="Select a currency…"
  searchable={false}
/>`,
  },
  {
    name: "Searchable multi-select",
    description: "Pass multiple with an array value to select several options. Search filters the visible options without clearing selections, and the dropdown remains open while options are toggled.",
    preview: <SearchableSelectMultiPreview />,
    code: `const [values, setValues] = useState<string[]>(["nz", "au"]);

<SearchableSelect
  multiple
  value={values}
  onChange={setValues}
  options={COUNTRIES}
  placeholder="Select countries…"
  searchPlaceholder="Search countries…"
  ariaLabel="Countries"
  clearable
/>`,
  },
  {
    name: "Non-searchable multi-select",
    description: "Multi-select remains available when searchable={false}. Use this combination for short lists that are quicker to scan than search.",
    preview: <SearchableSelectMultiNonSearchablePreview />,
    code: `<SearchableSelect
  multiple
  searchable={false}
  value={values}
  onChange={setValues}
  options={CURRENCIES}
  placeholder="Select currencies…"
  ariaLabel="Currencies"
/>`,
  },
  {
    name: "Code badge",
    description: "Pass codeBadge and include code in each option to show a grey pill badge on the right side of each item — useful for ledger accounts and product codes.",
    preview: <SearchableSelectCodeBadgePreview />,
    code: `const COA_ACCOUNTS = [
  { value: "1000", label: "Cash at Bank",        code: "1000" },
  { value: "1100", label: "Accounts Receivable", code: "1100" },
  { value: "4000", label: "Sales Revenue",        code: "4000" },
  // ...
];

<SearchableSelect
  value={value}
  onChange={setValue}
  options={COA_ACCOUNTS}
  placeholder="Select an account…"
  searchPlaceholder="Search accounts…"
  codeBadge
/>`,
  },
  {
    name: "Clearable",
    description: "Pass clearable to show an × button in the trigger when a value is selected. Clicking it sets the value to an empty string.",
    preview: <SearchableSelectClearablePreview />,
    code: `<SearchableSelect
  value={value}
  onChange={setValue}
  options={COUNTRIES}
  placeholder="Select a country…"
  clearable
/>`,
  },
  {
    name: "Error state",
    description: "Pass hasError to apply a red border. Always show a validation message below the field to explain what is wrong.",
    preview: <SearchableSelectErrorPreview />,
    code: `const hasError = !value;

<SearchableSelect
  value={value}
  onChange={setValue}
  options={COUNTRIES}
  placeholder="Select a country…"
  hasError={hasError}
/>
{hasError && (
  <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-danger)", fontWeight: 500 }}>
    Country is required.
  </p>
)}`,
  },
  {
    name: "Disabled",
    description: "Pass disabled to prevent interaction. The field renders in a muted style and ignores all pointer events.",
    preview: <SearchableSelectDisabledPreview />,
    code: `<SearchableSelect
  value="nz"
  onChange={() => {}}
  options={COUNTRIES}
  placeholder="Select a country…"
  disabled
/>`,
  },
];

const PROP_TABLE = [
  { name: "multiple", type: "boolean", required: "", description: "Use multi-select mode with an array value (default: false)" },
  { name: "value", type: "string | string[]", required: "✓", description: "The selected value, or selected values when multiple is true" },
  { name: "onChange", type: "(value: string | string[]) => void", required: "✓", description: "Called immediately when the selection changes; the value shape follows multiple" },
  { name: "options", type: "{ value: string; label: string; code?: string }[]", required: "✓", description: "The options to display" },
  { name: "placeholder", type: "string", required: "", description: "Trigger text shown when no option is selected" },
  { name: "searchPlaceholder", type: "string", required: "", description: "Placeholder inside the search input" },
  { name: "searchable", type: "boolean", required: "", description: "Show a search input in the dropdown (default: true)" },
  { name: "codeBadge", type: "boolean", required: "", description: "Render the option code as a grey pill badge (default: true when code is present)" },
  { name: "clearable", type: "boolean", required: "", description: "Show an × button in the trigger to clear the selection" },
  { name: "hasError", type: "boolean", required: "", description: "Applies red border for validation error state" },
  { name: "disabled", type: "boolean", required: "", description: "Disables the select — muted style, no pointer events" },
  { name: "dropdownWidth", type: "string | number", required: "", description: "Override the dropdown width (default: matches the trigger width)" },
  { name: "dropdownAlign", type: '"left" | "right"', required: "", description: "Align the dropdown with the left or right edge of the trigger" },
  { name: "ariaLabel", type: "string", required: "", description: "Accessible name when no external label is referenced" },
  { name: "ariaLabelledBy", type: "string", required: "", description: "ID of an element that labels the control" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Searchable Select</h1>
        <p className={pageStyles.description}>
          A custom dropdown with optional search filtering. Replaces native {"<select>"} elements throughout the application.
          Supports single and multiple selection, code badges for ledger accounts, clearable selection, error state, and a non-searchable mode for short lists.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ SearchableSelect }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Props</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Required</th><th>Description</th></tr>
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
