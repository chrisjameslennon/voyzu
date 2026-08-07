import { getSingletonHighlighter } from "shiki";
import { RadioGroupPreview, RadioIndividualPreview, RadioDisabledPreview } from "./radio-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "RadioGroup",
    description: "The recommended way to render a group of radio buttons. Pass options as an array of { label, value } objects.",
    preview: <RadioGroupPreview />,
    code: `const [value, setValue] = useState("bank_transfer");

<RadioGroup
  name="payment-method"
  value={value}
  onChange={setValue}
  options={[
    { value: "credit_card",   label: "Credit card" },
    { value: "bank_transfer", label: "Bank transfer" },
    { value: "direct_debit",  label: "Direct debit" },
    { value: "cash",          label: "Cash" },
  ]}
/>`,
  },
  {
    name: "Individual Radio — rich label",
    description: "Use the Radio component directly when each option needs a complex label layout (e.g. a description below the label text).",
    preview: <RadioIndividualPreview />,
    code: `const [value, setValue] = useState<"monthly" | "annually">("monthly");

{(["monthly", "annually"] as const).map((opt) => (
  <label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
    <Radio
      name="billing"
      value={opt}
      checked={value === opt}
      onChange={() => setValue(opt)}
    />
    <span>
      <strong style={{ display: "block" }}>
        {opt === "monthly" ? "Monthly" : "Annually"}
      </strong>
      <span style={{ fontSize: "0.75rem", color: "var(--voyzu-color-text-secondary)" }}>
        {opt === "monthly"
          ? "Billed each month. Cancel any time."
          : "Save 20% — billed once per year."}
      </span>
    </span>
  </label>
))}`,
  },
  {
    name: "Disabled states",
    description: "Pass disabled to the Radio component to prevent interaction. Apply opacity and cursor: not-allowed to the wrapping label.",
    preview: <RadioDisabledPreview />,
    code: `<label style={{ cursor: "not-allowed", opacity: 0.55 }}>
  <Radio name="demo" value="a" checked={false} onChange={() => {}} disabled />
  Option A — disabled unchecked
</label>

<label style={{ cursor: "not-allowed", opacity: 0.55 }}>
  <Radio name="demo" value="b" checked={true} onChange={() => {}} disabled />
  Option B — disabled checked
</label>`,
  },
];

const RADIO_GROUP_PROPS = [
  { name: "options", type: "{ label: string; value: string }[]", required: "✓", description: "The radio options to render" },
  { name: "value", type: "string", required: "✓", description: "The currently selected value" },
  { name: "onChange", type: "(value: string) => void", required: "✓", description: "Called with the new value when selection changes" },
  { name: "name", type: "string", required: "", description: "HTML name attribute — groups the radios together for browser accessibility" },
];

const RADIO_PROPS = [
  { name: "checked", type: "boolean", required: "✓", description: "Whether this radio is selected" },
  { name: "onChange", type: "() => void", required: "✓", description: "Called when the user selects this radio" },
  { name: "disabled", type: "boolean", required: "", description: "Disables interaction" },
  { name: "...rest", type: "InputHTMLAttributes", required: "", description: "All other native input attributes (name, value, id, aria-*, etc.)" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Radio</h1>
        <p className={pageStyles.description}>
          Two components: <code>RadioGroup</code> for standard option lists, and <code>Radio</code> for individual styled radio inputs when a custom label layout is needed.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ RadioGroup }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
        <div className={pageStyles.importBlock} style={{ marginTop: "0.5rem" }}>
          <code>import {"{ Radio }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>RadioGroup props</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              {RADIO_GROUP_PROPS.map((p) => (
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
        <h2 className={pageStyles.sectionTitle}>Radio props</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              {RADIO_PROPS.map((p) => (
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
