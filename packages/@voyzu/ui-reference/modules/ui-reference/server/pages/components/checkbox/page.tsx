import { getSingletonHighlighter } from "shiki";
import { CheckboxBasicPreview, CheckboxDisabledPreview, CheckboxGroupPreview, CheckboxInvalidPreview } from "./checkbox-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Basic controlled checkbox",
    description: "A single controlled checkbox. Click to toggle. Pass the boolean state and a setter as onChange.",
    preview: <CheckboxBasicPreview />,
    code: `const [checked, setChecked] = useState(false);

<label style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
  <Checkbox checked={checked} onChange={setChecked} />
  Subscribe to email notifications
</label>`,
  },
  {
    name: "Checkbox group",
    description: "Multiple checkboxes for multi-select. Manage a Set<string> and toggle membership on each change.",
    preview: <CheckboxGroupPreview />,
    code: `const [selected, setSelected] = useState<Set<string>>(new Set(["email"]));

const toggle = (value: string) => {
  setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  });
};

{options.map((opt) => (
  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
    <Checkbox checked={selected.has(opt.value)} onChange={() => toggle(opt.value)} />
    {opt.label}
  </label>
))}`,
  },
  {
    name: "Invalid state",
    description: "Pass invalid when validation fails. The component applies the error appearance and sets aria-invalid.",
    preview: <CheckboxInvalidPreview />,
    code: `<Checkbox
  checked={accepted}
  invalid={validation.hasError("acceptTerms")}
  required
  onChange={setAccepted}
/>`,
  },
  {
    name: "Disabled states",
    description: "Pass disabled to prevent interaction. Apply cursor: not-allowed and reduced opacity to the wrapping label for visual clarity.",
    preview: <CheckboxDisabledPreview />,
    code: `<label style={{ cursor: "not-allowed", opacity: 0.55 }}>
  <Checkbox checked={false} onChange={() => {}} disabled />
  Disabled unchecked
</label>

<label style={{ cursor: "not-allowed", opacity: 0.55 }}>
  <Checkbox checked={true} onChange={() => {}} disabled />
  Disabled checked
</label>`,
  },
];

const PROP_TABLE = [
  { name: "checked", type: "boolean", required: "✓", description: "Whether the checkbox is checked" },
  { name: "onChange", type: "(checked: boolean) => void", required: "✓", description: "Called with the new boolean when toggled" },
  { name: "invalid", type: "boolean", required: "", description: "Applies the validation error state and sets aria-invalid" },
  { name: "disabled", type: "boolean", required: "", description: "Disables interaction" },
  { name: "...rest", type: "InputHTMLAttributes", required: "", description: "All other native input attributes (id, name, aria-*, etc.)" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Checkbox</h1>
        <p className={pageStyles.description}>
          A styled checkbox that wraps the native input. Use it standalone or in groups to represent multi-select choices.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ Checkbox }"} from &quot;@voyzu/ui-components&quot;</code>
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
