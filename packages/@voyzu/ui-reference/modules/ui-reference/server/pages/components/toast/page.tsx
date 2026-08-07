import { getSingletonHighlighter } from "shiki";
import { ToastBasicPreview, ToastMessageCyclePreview } from "./toast-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Basic toast",
    description: "Click the button to show the toast. It auto-dismisses after 5 seconds, or can be closed manually with the × button.",
    preview: <ToastBasicPreview />,
    code: `const [isVisible, setIsVisible] = useState(false);

// Show after a successful mutation:
const handleCreate = async () => {
  await createInvoice(data);
  setIsVisible(true);
};

<Button variant="primary" onClick={handleCreate}>
  Create invoice
</Button>

<Toast
  isVisible={isVisible}
  onClose={() => setIsVisible(false)}
  message="Invoice INV-2025-001 created successfully."
/>`,
  },
  {
    name: "Cycling through messages",
    description: "The same Toast instance can show different messages — update the message prop while toggling isVisible. The component re-starts its 5-second timer each time isVisible flips to true.",
    preview: <ToastMessageCyclePreview />,
    code: `const MESSAGES = [
  "Invoice INV-2025-001 created successfully.",
  "Contact details updated.",
  "File export complete — 847 records exported.",
  "Payment of $4,200.00 recorded.",
];

const [isVisible, setIsVisible] = useState(false);
const [msgIndex, setMsgIndex] = useState(0);

const showNext = () => {
  setMsgIndex((i) => (i + 1) % MESSAGES.length);
  setIsVisible(true);
};

<Button variant="secondary" onClick={showNext}>
  Show next message
</Button>

<Toast
  isVisible={isVisible}
  onClose={() => setIsVisible(false)}
  message={MESSAGES[msgIndex]!}
/>`,
  },
];

const PROP_TABLE = [
  { name: "isVisible", type: "boolean", required: "✓", description: "Controls whether the toast is shown. Flip to true to trigger it; the component handles the fade animation." },
  { name: "onClose", type: "() => void", required: "✓", description: "Called when the auto-dismiss timer fires or the user clicks ×. Set isVisible to false here." },
  { name: "message", type: "string", required: "✓", description: "The message to display in the toast" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Toast</h1>
        <p className={pageStyles.description}>
          A fixed-position notification that slides in from the bottom of the screen. Auto-dismisses after 5 seconds.
          Trigger it in the success path of an async mutation — never on mount.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ Toast }"} from &quot;@voyzu/ui-components&quot;</code>
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
