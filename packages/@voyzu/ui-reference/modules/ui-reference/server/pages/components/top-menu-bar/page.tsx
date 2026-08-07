import { getSingletonHighlighter } from "shiki";
import { TopMenuBarBasicPreview } from "./top-menu-bar-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const PROP_TABLE = [
  { name: "sections",    type: "NavSection[]",           required: "✓", description: "Navigation sections shown as tabs. Each section has a label, landingPath, and items array." },
  { name: "onSelect",    type: "(item: string) => void", required: "✓", description: "Called with the section label when the user clicks a tab. Navigate to section.landingPath in your handler." },
  { name: "helpUrl",     type: "string",                 required: "",  description: "Optional documentation URL for the help icon. Omit to hide the help icon." },
  { name: "activeItem",  type: "string",                 required: "",  description: "Label of the currently active section. That tab renders with an underline accent." },
  { name: "logoSrc",     type: "string",                 required: "",  description: "URL of the logo image shown on the left. Omit to render no logo — useful when the URL is not available in the current environment." },
];

const STORIES = [
  {
    name: "Basic",
    description: "Click a section tab to make it active. The orange underline tracks the activeItem prop.",
    preview: <TopMenuBarBasicPreview />,
    code: `import TopMenuBar from "@voyzu/ui-components";
import type { NavSection } from "@voyzu/ui-components";

const NAV_SECTIONS: NavSection[] = [
  { label: "Finance",      landingPath: "/finance",      items: [] },
  { label: "Organization", landingPath: "/organization", items: [] },
  { label: "Accounts",     landingPath: "/accounts",     items: [] },
  { label: "Security",     landingPath: "/security",     items: [] },
];

const [activeItem, setActiveItem] = useState("Finance");

<TopMenuBar
  sections={NAV_SECTIONS}
  activeItem={activeItem}
  onSelect={(label) => {
    setActiveItem(label);
    const section = NAV_SECTIONS.find((s) => s.label === label);
    if (section) router.push(section.landingPath);
  }}
  helpUrl="https://voyzu.gitbook.io/docs/"
  logoSrc="/voyzu/voyzu_color_logo_transparent.png"
/>`,
  },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Top Menu Bar</h1>
        <p className={pageStyles.description}>
          The horizontal application header rendered at the top on tablet and desktop viewports.
          Shows domain-level navigation tabs, an optional help link, and the user menu.
          On mobile it is replaced by a hamburger button that opens the{" "}
          <a className={pageStyles.link} href="/components/mobile-nav-drawer">Mobile Drawer</a>.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import TopMenuBar from &quot;@voyzu/ui-components&quot;</code>
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
