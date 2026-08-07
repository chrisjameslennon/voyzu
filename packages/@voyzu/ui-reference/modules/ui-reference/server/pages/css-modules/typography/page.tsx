import { getSingletonHighlighter } from "shiki";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "pageTitle",
    description: "Top-level page heading. Uses the heading font family (Manrope) and scales down responsively on tablet and mobile.",
    element: "h1",
    preview: <h1 className={typography.pageTitle} style={{ margin: 0 }}>Journal List</h1>,
    code: `<h1 className={typography.pageTitle}>Journal List</h1>`,
  },
  {
    name: "contentTitle",
    description: "Secondary heading for named content areas within a page, such as a card or panel header.",
    element: "h2",
    preview: <h2 className={typography.contentTitle} style={{ margin: 0 }}>Integration Configuration</h2>,
    code: `<h2 className={typography.contentTitle}>Integration Configuration</h2>`,
  },
  {
    name: "headingByline",
    description: "Descriptive text that follows a contentTitle — explains what the section is or does.",
    element: "p",
    preview: <p className={typography.headingByline} style={{ margin: 0 }}>Integration configuration is used to derive values when external systems post to a company sub-ledger.</p>,
    code: `<p className={typography.headingByline}>
  Integration configuration is used to derive values
  when external systems post to a company sub-ledger.
</p>`,
  },
  {
    name: "bodyText",
    description: "Standard paragraph text for normal content inside cards, panels, and forms.",
    element: "p",
    preview: <p className={typography.bodyText}>This role has access to all companies.</p>,
    code: `<p className={typography.bodyText}>
  This role has access to all companies.
</p>`,
  },
  {
    name: "sectionHeading",
    description: "Card-level section heading. Smaller than contentTitle, includes a bottom margin to separate it from the content that follows.",
    element: "h3",
    preview: <h3 className={typography.sectionHeading} style={{ marginTop: 0 }}>Posting Details</h3>,
    code: `<h3 className={typography.sectionHeading}>Posting Details</h3>`,
  },
  {
    name: "fieldLabel",
    description: "Label above a form field. Uppercase, tightly spaced, and muted — sits above both editable inputs and readonlyValue elements.",
    element: "label",
    preview: <label className={typography.fieldLabel}>Posting Date</label>,
    code: `<label className={typography.fieldLabel}>Posting Date</label>`,
  },
  {
    name: "fieldHelp",
    description: "Short help text below a field. Use it for validation rules, expected formats, or other field-specific guidance.",
    element: "p",
    preview: <p className={typography.fieldHelp} style={{ margin: 0 }}>Capital letters, numbers, dash (-) and underscore (_) only. 14 characters max.</p>,
    code: `<p className={typography.fieldHelp}>
  Capital letters, numbers, dash (-) and underscore (_) only. 14 characters max.
</p>`,
  },
  {
    name: "link",
    description: "Inline hyperlink style. Used for anchor tags within body text — underlined and coloured with the primary link token.",
    element: "a",
    preview: (
      <span style={{ fontSize: "0.875rem" }}>
        For more information,{" "}
        <a className={typography.link} href="#">
          read the documentation
        </a>
        .
      </span>
    ),
    code: `<a className={typography.link} href="https://voyzu.gitbook.io/docs">
  read the documentation
</a>`,
  },
] satisfies { name: string; description: string; element: string; preview: React.ReactNode; code: string }[];

const CLASS_TABLE = [
  { name: "pageTitle",      element: "h1",           description: "Responsive top-level page heading" },
  { name: "contentTitle",   element: "h2",           description: "Section or panel heading within a page" },
  { name: "headingByline",  element: "p",            description: "Descriptive text below a heading" },
  { name: "bodyText",       element: "p",            description: "Standard paragraph and inline body text" },
  { name: "sectionHeading", element: "h3",           description: "Card-level heading with bottom margin" },
  { name: "fieldLabel",     element: "label",        description: "Uppercase field label above inputs" },
  { name: "fieldHelp",      element: "p",            description: "Short help text below a field" },
  { name: "link",           element: "a",            description: "Inline hyperlink style" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>CSS Modules</p>
        <h1 className={pageStyles.title}>Typography</h1>
        <p className={pageStyles.description}>
          Eight classes covering the full hierarchy of text in the application - from page titles down to body text, field labels, help text, and links.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import typography from &quot;@voyzu/ui-style/css-modules/typography.module.css&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Classes</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr>
                <th>Class</th>
                <th>Element</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {CLASS_TABLE.map((c) => (
                <tr key={c.name}>
                  <td><code className={pageStyles.propName}>{c.name}</code></td>
                  <td><code className={pageStyles.propType}>{c.element}</code></td>
                  <td>{c.description}</td>
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
