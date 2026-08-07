import { getSingletonHighlighter } from "shiki";
import {
  DatePickerBasicPreview,
  DatePickerClearablePreview,
  DatePickerErrorPreview,
  DatePickerYearRangePreview,
  DatePickerMinMaxPreview,
} from "./date-picker-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Basic date picker",
    description: "A locale-aware calendar popup. Value is always a YYYY-MM-DD string. Click the field to open the calendar.",
    preview: <DatePickerBasicPreview />,
    code: `const [value, setValue] = useState("2025-04-15");

<DatePicker
  value={value}
  onChange={setValue}
  placeholder="Select a date"
/>`,
  },
  {
    name: "Clearable",
    description: "Pass clearable to show an × button when a date is selected. The clear sets the value to an empty string.",
    preview: <DatePickerClearablePreview />,
    code: `const [value, setValue] = useState("2025-06-30");

<DatePicker
  value={value}
  onChange={setValue}
  placeholder="Select a date"
  clearable
/>`,
  },
  {
    name: "Error state",
    description: "Pass hasError to highlight the field with a red border. Combine with a visible error message below the field.",
    preview: <DatePickerErrorPreview />,
    code: `const [value, setValue] = useState("");
const hasError = !value;

<DatePicker
  value={value}
  onChange={setValue}
  placeholder="Select a date"
  hasError={hasError}
/>
{hasError && (
  <p style={{ fontSize: "0.75rem", color: "var(--voyzu-color-danger)", fontWeight: 500 }}>
    Invoice date is required.
  </p>
)}`,
  },
  {
    name: "Extended year range",
    description: "preYearOffset and postYearOffset control how far back and forward the year picker scrolls from the current year. Default is 10 in each direction.",
    preview: <DatePickerYearRangePreview />,
    code: `<DatePicker
  value={value}
  onChange={setValue}
  placeholder="Select incorporation date"
  clearable
  preYearOffset={80}
  postYearOffset={0}
/>`,
  },
  {
    name: "Min / max date",
    description: "minDate and maxDate constrain selection to an inclusive date range. Days outside the range are disabled in the calendar, navigation stops at the boundary month, and typed dates outside the range are rejected on blur.",
    preview: <DatePickerMinMaxPreview />,
    code: `<DatePicker
  value={value}
  onChange={setValue}
  minDate="2026-04-01"
  maxDate="2026-06-30"
  clearable={false}
/>`,
  },
];

const PROP_TABLE = [
  { name: "value", type: "string", required: "✓", description: "Selected date in YYYY-MM-DD format, or empty string for no selection" },
  { name: "onChange", type: "(value: string) => void", required: "✓", description: "Called with the new YYYY-MM-DD string when a date is selected" },
  { name: "placeholder", type: "string", required: "", description: "Placeholder text shown when no date is selected" },
  { name: "clearable", type: "boolean", required: "", description: "Shows a clear button when a date is selected" },
  { name: "hasError", type: "boolean", required: "", description: "Applies red border for validation error state" },
  { name: "preYearOffset", type: "number", required: "", description: "How many years before the current year to include in the year picker (default: 10)" },
  { name: "postYearOffset", type: "number", required: "", description: "How many years after the current year to include in the year picker (default: 10)" },
  { name: "minDate", type: "string", required: "", description: "Earliest selectable date (YYYY-MM-DD, inclusive). Disables earlier days and constrains calendar navigation." },
  { name: "maxDate", type: "string", required: "", description: "Latest selectable date (YYYY-MM-DD, inclusive). Disables later days and constrains calendar navigation." },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Date Picker</h1>
        <p className={pageStyles.description}>
          A locale-aware calendar popup for selecting a single date. Stores value as a YYYY-MM-DD string.
          Supports keyboard navigation, year/month header controls, and an optional clear button.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ DatePicker }"} from &quot;@voyzu/ui-components&quot;</code>
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
