import { getSingletonHighlighter } from "shiki";

import { Button } from "@voyzu/ui-components";

// deploy...

import styles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Variants",
    preview: (
      <>
        <Button variant="primary">Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="secondary-destructive">Secondary Destructive</Button>
        <Button variant="plain">Plain</Button>
        <Button variant="cancel">Cancel</Button>
        <Button variant="danger">Danger</Button>
      </>
    ),
    code: `<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="secondary-destructive">Secondary Destructive</Button>
<Button variant="plain">Plain</Button>
<Button variant="cancel">Cancel</Button>
<Button variant="danger">Danger</Button>`,
  },
  {
    name: "With icon",
    preview: (
      <>
        <Button variant="primary" icon="save">Save</Button>
        <Button variant="secondary" icon="edit">Edit</Button>
        <Button variant="secondary-destructive" icon="delete">Delete</Button>
        <Button variant="cancel" icon="arrow_back">Back</Button>
        <Button variant="danger" icon="warning">Delete permanently</Button>
      </>
    ),
    code: `<Button variant="primary" icon="save">Save</Button>
<Button variant="secondary" icon="edit">Edit</Button>
<Button variant="secondary-destructive" icon="delete">Delete</Button>
<Button variant="cancel" icon="arrow_back">Back</Button>
<Button variant="danger" icon="warning">Delete permanently</Button>`,
  },
  {
    name: "Sizes",
    preview: (
      <>
        <Button variant="primary">Medium</Button>
        <Button variant="primary" size="small">Small</Button>
        <Button variant="secondary" icon="edit">Medium</Button>
        <Button variant="secondary" icon="edit" size="small">Small</Button>
        <Button variant="plain" icon="refresh" />
        <Button variant="plain" icon="refresh" size="small" />
      </>
    ),
    code: `<Button variant="primary">Medium</Button>
<Button variant="primary" size="small">Small</Button>
<Button variant="secondary" icon="edit">Medium</Button>
<Button variant="secondary" icon="edit" size="small">Small</Button>
<Button variant="plain" icon="refresh" />
<Button variant="plain" icon="refresh" size="small" />`,
  },
  {
    name: "Icon only",
    preview: (
      <>
        <Button variant="secondary" icon="refresh" />
        <Button variant="secondary-destructive" icon="delete" />
        <Button variant="danger" icon="warning" />
      </>
    ),
    code: `<Button variant="secondary" icon="refresh" />
<Button variant="secondary-destructive" icon="delete" />
<Button variant="danger" icon="warning" />`,
  },
  {
    name: "Disabled",
    preview: (
      <>
        <Button variant="primary" disabled>Primary</Button>
        <Button variant="secondary" disabled>Secondary</Button>
        <Button variant="secondary-destructive" disabled>Secondary Destructive</Button>
        <Button variant="plain" disabled>Plain</Button>
        <Button variant="cancel" disabled>Cancel</Button>
        <Button variant="danger" disabled>Danger</Button>
      </>
    ),
    code: `<Button variant="primary" disabled>Primary</Button>
<Button variant="secondary" disabled>Secondary</Button>
<Button variant="secondary-destructive" disabled>Secondary Destructive</Button>
<Button variant="plain" disabled>Plain</Button>
<Button variant="cancel" disabled>Cancel</Button>
<Button variant="danger" disabled>Danger</Button>`,
  },
] satisfies { name: string; preview: React.ReactNode; code: string }[];

const PROPS = [
  { name: "variant", type: `"primary" | "secondary" | "secondary-destructive" | "plain" | "cancel" | "danger"`, required: true, description: "Visual style" },
  { name: "icon", type: "string", required: false, description: "Material Symbol name rendered before children" },
  { name: "size", type: `"medium" | "small"`, required: false, description: "Button size. Defaults to medium." },
  { name: "children", type: "React.ReactNode", required: false, description: "Button label. Omit for icon-only." },
  { name: "...rest", type: "ButtonHTMLAttributes", required: false, description: "All native button props (onClick, disabled, title, …)" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Components</p>
        <h1 className={styles.title}>Button</h1>
        <p className={styles.description}>
          General-purpose action button. Choose a variant that communicates intent, then add an optional icon from{" "}
          <a className={styles.link} href="https://fonts.google.com/icons" target="_blank" rel="noreferrer">
            Material Symbols
          </a>.
        </p>
        <div className={styles.importBlock}>
          <code>import {"{ Button }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Props</h2>
        <div className={styles.tableWrap}>
          <table className={styles.propsTable}>
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
                  <td><code className={styles.propName}>{p.name}</code></td>
                  <td><code className={styles.propType}>{p.type}</code></td>
                  <td className={styles.propRequired}>{p.required ? "Yes" : "—"}</td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {STORIES.map((story, i) => (
        <section key={story.name} className={styles.section}>
          <h2 className={styles.sectionTitle}>{story.name}</h2>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
            {story.preview}
          </div>
          <div className={styles.story}>
            <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtmls[i]! }} />
          </div>
        </section>
      ))}
    </main>
  );
}
