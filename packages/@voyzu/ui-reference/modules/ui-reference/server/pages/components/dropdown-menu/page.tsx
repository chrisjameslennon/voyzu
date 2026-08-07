import { getSingletonHighlighter } from "shiki";

import { Button } from "@voyzu/ui-components";
import { DropdownMenu } from "@voyzu/ui-components";
import pageStyles from "../../page.module.css";
import { PeriodPresetDropdownPreview } from "./dropdown-menu-previews";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const exportItems = [
  { value: "selected", label: "Selected (3)", icon: "check_box", details: "CSV" },
  { value: "current-view", label: "Current view (42)", icon: "visibility", details: "XLSX" },
  { value: "full-dataset", label: "Full dataset (128)", icon: "database", details: "XLSX" },
];

const STORIES = [
  {
    name: "Export menu",
    description: "A packaged version of the export dropdown pattern used across list screens.",
    preview: (
      <DropdownMenu
        trigger={<Button variant="plain" icon="file_download" title="Export" />}
        items={exportItems}
        alignment="right"
        width={260}
      />
    ),
    code: `<DropdownMenu
  trigger={<Button variant="plain" icon="file_download" title="Export" />}
  items={[
    { value: "selected", label: "Selected (3)", icon: "check_box", details: "CSV" },
    { value: "current-view", label: "Current view (42)", icon: "visibility", details: "XLSX" },
    { value: "full-dataset", label: "Full dataset (128)", icon: "database", details: "XLSX" },
  ]}
  alignment="right"
  width={260}
/>`,
  },
  {
    name: "Disabled item",
    description: "Disabled items remain visible but cannot be selected.",
    preview: (
      <DropdownMenu
        trigger={<Button variant="secondary" icon="more_vert">Actions</Button>}
        items={[
          { value: "edit", label: "Edit", icon: "edit" },
          { value: "duplicate", label: "Duplicate", icon: "content_copy", disabled: true },
          { value: "archive", label: "Archive", icon: "archive" },
        ]}
      />
    ),
    code: `<DropdownMenu
  trigger={<Button variant="secondary" icon="more_vert">Actions</Button>}
  items={[
    { value: "edit", label: "Edit", icon: "edit" },
    { value: "duplicate", label: "Duplicate", icon: "content_copy", disabled: true },
    { value: "archive", label: "Archive", icon: "archive" },
  ]}
/>`,
  },
  {
    name: "Trigger caret",
    description: "Set caret to add a trailing expand_more icon to the trigger. The caret rotates while the menu is open.",
    preview: (
      <DropdownMenu
        trigger={<Button variant="secondary" icon="visibility">View</Button>}
        caret
        items={[
          { value: "journal", label: "View Journal", icon: "account_balance" },
          { value: "tax", label: "View Tax", icon: "receipt_long" },
          { value: "document", label: "View Original Document Supplied", icon: "description" },
          { value: "calculations", label: "View Calculations", icon: "functions" },
        ]}
        width={300}
      />
    ),
    code: `<DropdownMenu
  trigger={<Button variant="secondary" icon="visibility">View</Button>}
  caret
  items={[
    { value: "journal", label: "View Journal", icon: "account_balance" },
    { value: "tax", label: "View Tax", icon: "receipt_long" },
    { value: "document", label: "View Original Document Supplied", icon: "description" },
    { value: "calculations", label: "View Calculations", icon: "functions" },
  ]}
  width={300}
/>`,
  },
  {
    name: "Dynamic trigger with submenu",
    description: "The parent owns the selected period state. A Periods item opens a one-level submenu for month selection.",
    preview: <PeriodPresetDropdownPreview />,
    code: `const [selectedValue, setSelectedValue] = useState("this-financial-year");
const [selectedLabel, setSelectedLabel] = useState("This financial year");

<DropdownMenu
  trigger={<Button variant="secondary" icon="calendar_today">{selectedLabel}</Button>}
  selectedValue={selectedValue}
  width={240}
  items={[
    {
      value: "this-financial-year",
      label: "This financial year",
      icon: "calendar_month",
      onSelect: () => {
        setSelectedValue("this-financial-year");
        setSelectedLabel("This financial year");
      },
    },
    {
      value: "last-financial-year",
      label: "Last financial year",
      icon: "history",
      onSelect: () => {
        setSelectedValue("last-financial-year");
        setSelectedLabel("Last financial year");
      },
    },
    {
      value: "periods",
      label: "Periods",
      icon: "date_range",
      children: months.map((month) => ({
        value: \`period-\${month}\`,
        label: month,
        onSelect: () => {
          setSelectedValue(\`period-\${month}\`);
          setSelectedLabel(month);
        },
      })),
    },
  ]}
/>`,
  },
  {
    name: "Danger item",
    description: "Use the danger item variant for destructive actions.",
    preview: (
      <DropdownMenu
        trigger={<Button variant="plain" icon="settings">Options</Button>}
        items={[
          { value: "share", label: "Share", icon: "share" },
          { value: "rename", label: "Rename", icon: "drive_file_rename_outline" },
          { value: "delete", label: "Delete", icon: "delete", variant: "danger" },
        ]}
      />
    ),
    code: `<DropdownMenu
  trigger={<Button variant="plain" icon="settings">Options</Button>}
  items={[
    { value: "share", label: "Share", icon: "share" },
    { value: "rename", label: "Rename", icon: "drive_file_rename_outline" },
    { value: "delete", label: "Delete", icon: "delete", variant: "danger" },
  ]}
/>`,
  },
] satisfies { name: string; description: string; preview: React.ReactNode; code: string }[];

const PROPS = [
  { name: "trigger", type: "ReactElement | render function", required: "Yes", description: "Element that toggles the menu." },
  { name: "items", type: "DropdownMenuItem[]", required: "Yes", description: "Selectable menu items." },
  { name: "caret", type: "boolean", required: "", description: "Adds a trailing downward caret to the trigger; rotates while open." },
  { name: "alignment", type: `"left" | "right"`, required: "", description: "Horizontal alignment relative to the trigger. Defaults to left." },
  { name: "width", type: `"content" | "trigger" | number`, required: "", description: "Menu width mode. Numeric values are pixels." },
  { name: "selectedValue", type: "string", required: "", description: "Highlights the matching item value." },
  { name: "open", type: "boolean", required: "", description: "Controlled open state." },
  { name: "defaultOpen", type: "boolean", required: "", description: "Initial uncontrolled open state." },
  { name: "onOpenChange", type: "(open: boolean) => void", required: "", description: "Called when the menu opens or closes." },
  { name: "closeOnSelect", type: "boolean", required: "", description: "Close after item selection. Defaults to true." },
];

const ITEM_PROPS = [
  { name: "value", type: "string", required: "Yes", description: "Stable item identifier." },
  { name: "label", type: "ReactNode", required: "Yes", description: "Main item label." },
  { name: "icon", type: "string", required: "", description: "Material Symbol name." },
  { name: "details", type: "ReactNode", required: "", description: "Right-aligned secondary text." },
  { name: "disabled", type: "boolean", required: "", description: "Prevents selection." },
  { name: "variant", type: `"default" | "danger"`, required: "", description: "Visual treatment for the item." },
  { name: "onSelect", type: "() => void", required: "", description: "Called when the item is selected." },
  { name: "children", type: "DropdownMenuItem[]", required: "", description: "One-level submenu items." },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Dropdown Menu</h1>
        <p className={pageStyles.description}>
          Triggered menu for compact action lists, based on the export dropdown pattern.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ DropdownMenu }"} from &quot;@voyzu/ui-components&quot;</code>
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
              {PROPS.map((p) => (
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
        <h2 className={pageStyles.sectionTitle}>DropdownMenuItem</h2>
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
              {ITEM_PROPS.map((p) => (
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
