import { getSingletonHighlighter } from "shiki";
import { Breadcrumbs, BreadcrumbsProvider } from "@voyzu/ui-components";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const PROP_TABLE = [
  { name: "slugs", type: "BreadcrumbItem[]", required: "", description: "Module-owned intermediate segments appended to the route's Surface-provided breadcrumbBase." },
  { name: "className", type: "string", required: "", description: "Extra class applied to the root <nav> element." },
];

const STORIES = [
  {
    name: "Surface-provided path",
    description: "The application Surface provides the ancestor path from the matched route's breadcrumbBase.",
    preview: (
      <BreadcrumbsProvider base={[{ label: "Organization" }, { label: "Companies", href: "/organization/companies" }]}>
        <Breadcrumbs />
      </BreadcrumbsProvider>
    ),
    code: `// modules-config/organization.ui.config.ts
breadcrumbBase: [
  { label: "Organization" },
  { label: "Companies", href: "/organization/companies" },
]

// Module page
<Breadcrumbs />`,
  },
  {
    name: "Module-owned segment",
    description: "Use slugs only when the module must append an intermediate segment that the static Surface route cannot resolve.",
    preview: (
      <BreadcrumbsProvider base={[{ label: "Finance", href: "/finance/journals" }, { label: "Reports" }]}>
        <Breadcrumbs slugs={[{ label: "Audit" }]} />
      </BreadcrumbsProvider>
    ),
    code: `<Breadcrumbs slugs={[{ label: "Audit" }]} />`,
  },
  {
    name: "In a page header grid",
    description: "Render the component in the standard breadcrumb layout slot.",
    preview: null,
    code: `import layout from "@voyzu/ui-layout/css-modules/detail.layout.module.css";

<div className={layout.slotBreadcrumb}>
  <Breadcrumbs />
</div>`,
  },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((story) => highlight(story.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Breadcrumbs</h1>
        <p className={pageStyles.description}>
          A desktop navigation trail rendered above the page heading and hidden on mobile. Voyzu
          Surface owns the ancestor path. The current page is identified by its heading and is not
          included in the trail.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ Breadcrumbs }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>BreadcrumbItem type</h2>
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
                <td>The text displayed for this segment.</td>
              </tr>
              <tr>
                <td><code className={pageStyles.propName}>href</code></td>
                <td><code className={pageStyles.propType}>string</code></td>
                <td className={pageStyles.propRequired}></td>
                <td>When provided, the segment renders as a link.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Props</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              {PROP_TABLE.map((prop) => (
                <tr key={prop.name}>
                  <td><code className={pageStyles.propName}>{prop.name}</code></td>
                  <td><code className={pageStyles.propType}>{prop.type}</code></td>
                  <td className={pageStyles.propRequired}>{prop.required}</td>
                  <td>{prop.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {STORIES.map((story, index) => (
        <section key={story.name} className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>{story.name}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
            {story.description}
          </p>
          {story.preview && <div style={{ marginBottom: "1.25rem" }}>{story.preview}</div>}
          <div className={pageStyles.story}>
            <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtmls[index]! }} />
          </div>
        </section>
      ))}
    </main>
  );
}
