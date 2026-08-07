import { getSingletonHighlighter } from "shiki";
import { ToggleSwitchBasicPreview, ToggleSwitchGroupPreview, ToggleSwitchDisabledPreview } from "./toggle-switch-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Basic toggle",
    description: "A single controlled toggle. Click to flip between on and off.",
    preview: <ToggleSwitchBasicPreview />,
    code: `const [checked, setChecked] = useState(false);

<div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
  <ToggleSwitch checked={checked} onChange={setChecked} />
  <span>{checked ? "Enabled" : "Disabled"}</span>
</div>`,
  },
  {
    name: "Settings group",
    description: "Toggles work well in settings panels where each row has a label, description, and a switch on the right.",
    preview: <ToggleSwitchGroupPreview />,
    code: `const [settings, setSettings] = useState({
  emailNotifications: true,
  twoFactor: false,
  autoApprove: true,
  darkMode: false,
});

const toggle = (key: keyof typeof settings) =>
  setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

{rows.map((row) => (
  <div key={row.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 0", borderBottom: "1px solid var(--voyzu-color-border)" }}>
    <div>
      <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 500 }}>{row.label}</p>
      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--voyzu-color-text-secondary)" }}>{row.description}</p>
    </div>
    <ToggleSwitch checked={settings[row.key]} onChange={() => toggle(row.key)} />
  </div>
))}`,
  },
  {
    name: "Disabled states",
    description: "Pass disabled to prevent interaction. The toggle renders in a muted style.",
    preview: <ToggleSwitchDisabledPreview />,
    code: `<ToggleSwitch checked={false} onChange={() => {}} disabled />
<ToggleSwitch checked={true} onChange={() => {}} disabled />`,
  },
];

const PROP_TABLE = [
  { name: "checked", type: "boolean", required: "✓", description: "Whether the toggle is in the on position" },
  { name: "onChange", type: "(checked: boolean) => void", required: "✓", description: "Called with the new boolean when the user clicks" },
  { name: "disabled", type: "boolean", required: "", description: "Prevents interaction and applies muted styling" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Toggle Switch</h1>
        <p className={pageStyles.description}>
          A binary on/off toggle. Renders as a {"<button role=\"switch\">"} for correct ARIA semantics.
          Use it in settings panels or anywhere a checkbox feels too lightweight.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ ToggleSwitch }"} from &quot;@voyzu/ui-components&quot;</code>
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
