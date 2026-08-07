import { getSingletonHighlighter } from "shiki";
import pageStyles from "../../page.module.css";
import { SplitButtonPrimaryPreview, SplitButtonSecondaryPreview, SplitButtonDisabledPreview } from "./split-button-previews";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Primary",
    description: "Use primary for the main create/add action on a list screen. The left button triggers the default action; the chevron opens a dropdown with alternative options.",
    preview: <SplitButtonPrimaryPreview />,
    code: `<SplitButton
  variant="primary"
  label="New Journal"
  icon="add"
  onClick={() => router.push("/finance/journals/create")}
  items={[
    { label: "Standard Journal", icon: "edit",              onClick: () => router.push("/finance/journals/create") },
    { label: "FX Journal",       icon: "currency_exchange", onClick: () => router.push("/finance/journals/create?mode=fx") },
  ]}
/>`,
  },
  {
    name: "Secondary",
    description: "Use secondary for toolbar actions that are not the primary page action.",
    preview: <SplitButtonSecondaryPreview />,
    code: `<SplitButton
  variant="secondary"
  label="Export"
  icon="file_download"
  onClick={() => handleExport(currentPage)}
  items={[
    { label: "Current page", icon: "visibility", onClick: () => handleExport(currentPage) },
    { label: "Full dataset",  icon: "database",   onClick: () => handleExport(allRows) },
  ]}
/>`,
  },
  {
    name: "Disabled",
    description: "Set disabled to prevent interaction when the action is unavailable.",
    preview: <SplitButtonDisabledPreview />,
    code: `<SplitButton
  variant="primary"
  label="New Journal"
  icon="add"
  onClick={() => {}}
  disabled
  items={[...]}
/>`,
  },
];

const PROP_TABLE = [
  { name: "variant",   type: '"primary" | "secondary"', required: "",    description: 'Visual style. Defaults to "primary".' },
  { name: "label",     type: "string",                  required: "Yes", description: "Text on the main button." },
  { name: "icon",      type: "string",                  required: "",    description: "Material Symbol name shown before the label." },
  { name: "onClick",   type: "() => void",              required: "Yes", description: "Called when the main button is clicked." },
  { name: "items",     type: "SplitButtonItem[]",       required: "Yes", description: "Dropdown options. Each item has label, optional icon, and onClick." },
  { name: "disabled",  type: "boolean",                 required: "",    description: "Disables both the main button and the chevron toggle." },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Split Button</h1>
        <p className={pageStyles.description}>
          A button with a built-in dropdown for alternative actions. The left segment triggers the primary action directly;
          the right chevron opens a menu of secondary options. Manages its own open/close state and closes on outside click.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ SplitButton }"} from &quot;@voyzu/ui-components&quot;</code>
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
        <h2 className={pageStyles.sectionTitle}>SplitButtonItem type</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code className={pageStyles.propName}>label</code></td>
                <td><code className={pageStyles.propType}>string</code></td>
                <td className={pageStyles.propRequired}>Yes</td>
                <td>Menu item text. Also used as the React key.</td>
              </tr>
              <tr>
                <td><code className={pageStyles.propName}>icon</code></td>
                <td><code className={pageStyles.propType}>string</code></td>
                <td className={pageStyles.propRequired}></td>
                <td>Material Symbol name shown before the label.</td>
              </tr>
              <tr>
                <td><code className={pageStyles.propName}>onClick</code></td>
                <td><code className={pageStyles.propType}>{"() => void"}</code></td>
                <td className={pageStyles.propRequired}>Yes</td>
                <td>Called when this item is selected. The dropdown closes automatically.</td>
              </tr>
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
