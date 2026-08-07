import { getSingletonHighlighter } from "shiki";
import { ValidationAlertSinglePreview, ValidationAlertMultiplePreview } from "./validation-alert-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Single error",
    description: "Click the button to show the alert with one error. The × dismisses it. In real usage, set visible after a failed form submit.",
    preview: <ValidationAlertSinglePreview />,
    code: `const [visible, setVisible] = useState(false);

// On form submit:
const handleSubmit = () => {
  const isValid = validate(); // your validation logic
  if (!isValid) {
    setVisible(true);
    return;
  }
  // proceed with submission
};

<ValidationAlert
  errors={["Invoice date is required."]}
  visible={visible}
  onDismiss={() => setVisible(false)}
/>`,
  },
  {
    name: "Multiple errors",
    description: "Pass multiple strings in errors to list all validation failures at once. Each error is rendered as a separate bullet.",
    preview: <ValidationAlertMultiplePreview />,
    code: `const validation = useFormValidation(() => ({
  date:     { label: "Invoice date", value: state.date,     rules: [required()] },
  lines:    { label: "Line items",   value: state.lines,    rules: [required()] },
  customer: { label: "Customer",     value: state.customer, rules: [required()] },
}));

const handleSubmit = () => {
  if (!validation.attempt()) return;
  // proceed
};

<ValidationAlert
  errors={validation.errors}
  visible={validation.showErrors}
  onDismiss={validation.dismiss}
/>`,
  },
];

const PROP_TABLE = [
  { name: "errors", type: "string[]", required: "✓", description: "List of error messages to display. Each renders as a separate bullet item." },
  { name: "visible", type: "boolean", required: "✓", description: "Controls whether the alert is rendered. Set to false in onDismiss." },
  { name: "onDismiss", type: "() => void", required: "✓", description: "Called when the user clicks the × button. Set visible to false here." },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Validation Alert</h1>
        <p className={pageStyles.description}>
          A dismissible error banner for displaying form validation failures. Show it after a failed submit — not on page load.
          Pairs with the <code>useFormValidation</code> hook, which provides <code>errors</code>, <code>showErrors</code>, and <code>dismiss()</code>.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ ValidationAlert }"} from &quot;@voyzu/ui-components&quot;</code>
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

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>With useFormValidation</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
          ValidationAlert integrates directly with the <code>useFormValidation</code> hook exported from <code>@voyzu/ui-components</code>.
          The hook provides <code>errors</code>, <code>showErrors</code>, and <code>dismiss()</code> that map directly to the alert&apos;s props.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ useFormValidation, required }"} from &quot;@voyzu/ui-components&quot;</code>
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
