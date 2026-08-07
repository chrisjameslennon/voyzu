import { getSingletonHighlighter } from "shiki";

import { AlertColorPreview, AlertVariantPreview, AlertDismissablePreview } from "./alert-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Colors",
    description: "Alert colors use the same semantic feedback palette as Badge, with brand included for product-specific notices.",
    preview: <AlertColorPreview />,
    code: `import { Alert } from "@voyzu/ui-components";

<Alert
  variant="soft"
  color="info"
  title="Processing ready"
  text={
    <>
      Review the extracted data before posting.{" "}
      <a href="/docs">Read the processing guide</a>.
    </>
  }
/>`,
  },
  {
    name: "Variants",
    description: "Use soft for normal notices, solid for high emphasis, and outline where the page background should remain quiet.",
    preview: <AlertVariantPreview />,
    code: `<Alert variant="soft" color="info" title="Soft" text="Low-emphasis informational message." />
<Alert variant="solid" color="info" title="Solid" text="Higher-emphasis informational message." />
<Alert variant="outline" color="info" title="Outline" text="Border-only informational message." />`,
  },
  {
    name: "Dismissable",
    description: "Set dismissable when the user can hide a contextual notice. The component manages its dismissed state internally.",
    preview: <AlertDismissablePreview />,
    code: `<Alert
  variant="soft"
  color="brand"
  title="Brand notice"
  text={
    <>
      This alert supports inline links, such as{" "}
      <a href="/components/badge">Badge reference</a>.
    </>
  }
  dismissable
/>`,
  },
];

const PROPS = [
  { name: "variant", type: `"soft" | "solid" | "outline"`, required: "Yes", description: "Visual treatment for the alert." },
  { name: "color", type: `"brand" | "info" | "success" | "warning" | "danger" | "neutral" | "plain"`, required: "Yes", description: "Semantic colour palette." },
  { name: "title", type: "React.ReactNode", required: "Yes", description: "Short alert heading." },
  { name: "text", type: "React.ReactNode", required: "Yes", description: "Alert body. Pass JSX when links or inline markup are needed." },
  { name: "dismissable", type: "boolean", required: "", description: "Shows a close button and hides the alert after dismissal." },
  { name: "...rest", type: "HTMLAttributes<HTMLDivElement>", required: "", description: "Native div attributes." },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Alert</h1>
        <p className={pageStyles.description}>
          A contextual message block for product notices, status feedback, and supporting information.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ Alert }"} from &quot;@voyzu/ui-components&quot;</code>
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
