import { getSingletonHighlighter } from "shiki";
import { MobileNavDrawerPreview } from "./mobile-nav-drawer-previews";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const PROP_TABLE = [
  { name: "isOpen",            type: "boolean",                        required: "✓", description: "Controls whether the drawer is rendered. When false the component returns null." },
  { name: "onClose",           type: "() => void",                     required: "✓", description: "Called when the user taps the backdrop or the × button." },
  { name: "domains",           type: "string[]",                       required: "✓", description: "List of domain names shown in the Domains section. Clicking a domain calls onSelectDomain." },
  { name: "activeDomain",      type: "string",                         required: "✓", description: "The currently selected domain. That item is highlighted with a brand-colour accent." },
  { name: "onSelectDomain",    type: "(domain: string) => void",       required: "✓", description: "Called when the user taps a domain. Update activeDomain and close the drawer in this handler." },
  { name: "navSections",       type: "DrawerNavSection[]",             required: "✓", description: "Nav items for the active domain. Each section has an optional sectionLabel and an items array. Multiple sections render with sub-heading labels." },
  { name: "currentPath",       type: "string",                         required: "✓", description: "The current URL path. Nav items whose path matches are highlighted as active." },
  { name: "onNavigate",        type: "(path: string) => void",         required: "✓", description: "Called when a leaf nav item is tapped. Perform the navigation and close the drawer here." },
  { name: "selectedCompany",   type: "Company | null",                 required: "",  description: "The company currently in context. Shown in the company selector when showCompanySelector is true." },
  { name: "companies",         type: "Company[]",                      required: "",  description: "List of companies the user can switch between. Rendered as a dropdown when showCompanySelector is true." },
  { name: "onSelectCompany",   type: "(company: Company) => void",     required: "",  description: "Called when the user picks a company from the dropdown." },
  { name: "showCompanySelector", type: "boolean",                      required: "",  description: "Renders the Active Company selector section. Typically true for Finance and Accounts domains." },
  { name: "logoSrc",           type: "string",                         required: "",  description: "URL of the logo shown in the drawer header. Omit to show no logo." },
];

const STORIES = [
  {
    name: "With company selector",
    description: "Click the button to open the drawer. Switch domains using the Domains section. The company selector appears for Finance and Accounts. The Journals nav item is highlighted as active.",
    preview: <MobileNavDrawerPreview />,
    code: `import { MobileNavDrawer, type DrawerNavSection } from "@voyzu/ui-components";

const [isOpen, setIsOpen] = useState(false);
const [activeDomain, setActiveDomain] = useState("Finance");
const [selectedCompany, setSelectedCompany] = useState(companies[0]);

// Build sections from your nav data for the active domain:
const navSections: DrawerNavSection[] = activeDomain === "Finance"
  ? [
      { items: FINANCE_NAV },
      { sectionLabel: "Reports", items: REPORTS_NAV },
    ]
  : [{ items: orgNavItems }];

<button onClick={() => setIsOpen(true)}>
  <span className="material-symbols-outlined">menu</span>
</button>

<MobileNavDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  domains={["Finance", "Organization", "Accounts", "Security"]}
  activeDomain={activeDomain}
  onSelectDomain={(d) => { setActiveDomain(d); }}
  navSections={navSections}
  currentPath={pathname}
  onNavigate={(path) => { router.push(path); setIsOpen(false); }}
  selectedCompany={selectedCompany}
  companies={companies}
  onSelectCompany={setSelectedCompany}
  showCompanySelector={activeDomain === "Finance" || activeDomain === "Accounts"}
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
        <h1 className={pageStyles.title}>Mobile Drawer</h1>
        <p className={pageStyles.description}>
          A full-screen slide-in navigation drawer for mobile viewports. Shows domain tabs,
          an optional company selector, and the nav items for the active domain.
          Rendered on top of a blurred backdrop — tapping it calls onClose.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ MobileNavDrawer }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Types</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Type</th><th>Shape</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code className={pageStyles.propName}>Company</code></td>
                <td><code className={pageStyles.propType}>{"{ id: number; name: string }"}</code></td>
              </tr>
              <tr>
                <td><code className={pageStyles.propName}>DrawerNavSection</code></td>
                <td><code className={pageStyles.propType}>{"{ sectionLabel?: string; items: NavItem[] }"}</code></td>
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
