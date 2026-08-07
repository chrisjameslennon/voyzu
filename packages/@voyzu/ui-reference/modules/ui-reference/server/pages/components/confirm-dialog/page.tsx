import { getSingletonHighlighter } from "shiki";
import { ConfirmDialogDangerPreview, ConfirmDialogPrimaryPreview } from "./confirm-dialog-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Danger — destructive action",
    description: "Use confirmVariant=\"danger\" for irreversible actions like deletion. The confirm button renders in the destructive style.",
    preview: <ConfirmDialogDangerPreview />,
    code: `const [isOpen, setIsOpen] = useState(false);

<Button variant="secondary-destructive" onClick={() => setIsOpen(true)}>
  Delete invoice
</Button>

<ConfirmDialog
  isOpen={isOpen}
  title="Delete invoice?"
  message="This action cannot be undone. Invoice INV-2025-003 and all associated line items will be permanently removed."
  confirmLabel="Delete invoice"
  confirmVariant="danger"
  onClose={() => setIsOpen(false)}
  onConfirm={() => {
    // perform delete
    setIsOpen(false);
  }}
/>`,
  },
  {
    name: "Primary — confirmation required",
    description: "Use confirmVariant=\"primary\" when an action needs confirmation but is not destructive.",
    preview: <ConfirmDialogPrimaryPreview />,
    code: `const [isOpen, setIsOpen] = useState(false);

<Button variant="primary" onClick={() => setIsOpen(true)}>
  Submit for approval
</Button>

<ConfirmDialog
  isOpen={isOpen}
  title="Submit for approval?"
  message="This invoice will be sent to the finance team for review. You will not be able to edit it while it is pending approval."
  confirmLabel="Submit"
  confirmVariant="primary"
  onClose={() => setIsOpen(false)}
  onConfirm={() => {
    // perform submit
    setIsOpen(false);
  }}
/>`,
  },
];

const PROP_TABLE = [
  { name: "isOpen", type: "boolean", required: "✓", description: "Controls whether the dialog is visible" },
  { name: "title", type: "string", required: "✓", description: "Bold heading shown at the top of the dialog" },
  { name: "message", type: "string", required: "✓", description: "Body text explaining what the user is confirming" },
  { name: "confirmLabel", type: "string", required: "✓", description: "Label for the confirm button" },
  { name: "confirmVariant", type: '"danger" | "primary"', required: "✓", description: "Style of the confirm button" },
  { name: "onClose", type: "() => void", required: "✓", description: "Called when the user clicks Cancel or the backdrop" },
  { name: "onConfirm", type: "() => void", required: "✓", description: "Called when the user clicks the confirm button" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Confirm Dialog</h1>
        <p className={pageStyles.description}>
          A modal dialog that asks the user to confirm or cancel an action. Always pair it with a trigger button — never show it on mount.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ ConfirmDialog }"} from &quot;@voyzu/ui-components&quot;</code>
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
