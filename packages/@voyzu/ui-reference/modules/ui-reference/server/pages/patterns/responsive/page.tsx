import { getSingletonHighlighter } from "shiki";
import { ResponsiveDemo } from "./responsive-demo";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const ZONES_TABLE = [
  { zone: "mobile",  range: "< 768px",      cssVar: "--breakpoint-tablet-min",   description: "Narrow viewport. Single-column layout, mobile nav drawer." },
  { zone: "tablet",  range: "768 – 1199px", cssVar: "--breakpoint-desktop-min",  description: "Medium viewport. Side nav present but may collapse columns." },
  { zone: "desktop", range: "≥ 1200px",     cssVar: "",                          description: "Wide viewport. Full layout with all columns and expanded nav." },
];

const HOOKS_TABLE = [
  { name: "useBreakpoint()",   returns: "\"mobile\" | \"tablet\" | \"desktop\"", description: "The current zone as a string. SSR-safe — returns \"desktop\" on the server, corrected after hydration." },
  { name: "useIsMobile()",     returns: "boolean",                               description: "True only in the mobile zone (< 768px)." },
  { name: "useIsTablet()",     returns: "boolean",                               description: "True only in the tablet zone (768–1199px)." },
  { name: "useIsTabletUp()",   returns: "boolean",                               description: "True for tablet or desktop — i.e. not mobile. The most common guard for hiding mobile-only UI." },
];

const CODE_EXAMPLES = [
  {
    title: "Hooks",
    description: "Import hooks from @voyzu/ui-layout. All re-render the component when the viewport crosses a breakpoint threshold.",
    code: `import { useBreakpoint, useIsMobile, useIsTablet, useIsTabletUp } from "@voyzu/ui-layout";

function MyComponent() {
  const zone       = useBreakpoint();    // "mobile" | "tablet" | "desktop"
  const isMobile   = useIsMobile();      // zone === "mobile"
  const isTablet   = useIsTablet();      // zone === "tablet"
  const isTabletUp = useIsTabletUp();    // zone !== "mobile"

  return <p>Current zone: {zone}</p>;
}`,
  },
  {
    title: "Conditional rendering",
    description: "Render different elements or pass different values based on the current zone. Prefer useIsTabletUp() over checking both tablet and desktop separately.",
    code: `const isMobile   = useIsMobile();
const isTabletUp = useIsTabletUp();

return (
  <div>
    {/* Show different nav on mobile */}
    {isMobile   && <MobileNavDrawer />}
    {isTabletUp && <SidebarNav />}

    {/* Adjust padding by zone */}
    <main style={{ padding: isMobile ? "1rem" : "2rem" }}>
      {children}
    </main>

    {/* Hide supplementary content on mobile */}
    {isTabletUp && (
      <aside>
        <SystemInfo record={record} />
      </aside>
    )}
  </div>
);`,
  },
  {
    title: "CSS media queries",
    description: "Use the CSS variables directly in media queries. They resolve to the same pixel values as the hooks.",
    code: `/* In a .module.css file */

.layout {
  display: grid;
  grid-template-columns: 1fr;          /* mobile: single column */
}

@media (min-width: 768px) {            /* or use var(--breakpoint-tablet-min) */
  .layout {
    grid-template-columns: 240px 1fr;  /* tablet+: sidebar + content */
  }
}

@media (min-width: 1200px) {
  .layout {
    grid-template-columns: 280px 1fr;  /* desktop: wider sidebar */
  }
}`,
  },
  {
    title: "DataTable — hideOnTablet and mobileRender",
    description: "DataTable has two built-in responsive hooks. hideOnTablet removes a column at tablet and below. mobileRender replaces the entire table on mobile with a custom card renderer.",
    code: `import type { DataTableColumn } from "@voyzu/ui-components";

const columns: DataTableColumn<Invoice>[] = [
  { key: "customer", label: "Customer", width: 240 },
  { key: "date",     label: "Date",     width: 120, hideOnTablet: true },  // hidden at tablet
  { key: "amount",   label: "Amount",   width: 120, align: "right" },
  { key: "status",   label: "Status",   width: 100, hideOnTablet: true },
  { key: "_spacer",  label: "",         render: () => null },               // absorbs remaining width
];

// mobileRender replaces the whole table on mobile:
<DataTable
  columns={columns}
  rows={invoices}
  mobileRender={(row) => (
    <div style={{ padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between" }}>
      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>{row.customer}</p>
        <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--voyzu-color-text-secondary)" }}>{row.date}</p>
      </div>
      <p style={{ margin: 0, fontWeight: 600 }}>{row.amount}</p>
    </div>
  )}
  {...otherProps}
/>`,
  },
  {
    title: "Breakpoints class — non-React contexts",
    description: "Outside of React (event listeners, utility functions, server actions), use the Breakpoints class directly. onChange returns a cleanup function compatible with useEffect.",
    code: `import { Breakpoints } from "@voyzu/ui-layout";

// Read the current zone once:
const zone = Breakpoints.current(); // "mobile" | "tablet" | "desktop"

// Guard a resize-sensitive calculation:
if (Breakpoints.isTabletUp()) {
  initSidebarAnimation();
}

// Subscribe to zone changes (returns a cleanup fn):
useEffect(() => {
  return Breakpoints.onChange((zone) => {
    console.log("Zone changed to:", zone);
  });
}, []);`,
  },
];

export default async function Page() {
  const codeHtmls = await Promise.all(CODE_EXAMPLES.map((e) => highlight(e.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Patterns</p>
        <h1 className={pageStyles.title}>Responsive</h1>
        <p className={pageStyles.description}>
          Three viewport zones — mobile, tablet, desktop — drive layout and component behaviour
          throughout the application. Use the React hooks for conditional rendering,
          CSS variables for media queries, and the <code>Breakpoints</code> class for non-React contexts.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ useBreakpoint, useIsMobile, useIsTablet, useIsTabletUp, Breakpoints }"} from &quot;@voyzu/ui-layout&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Breakpoint zones</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Zone</th><th>Range</th><th>CSS variable</th><th>Description</th></tr>
            </thead>
            <tbody>
              {ZONES_TABLE.map((z) => (
                <tr key={z.zone}>
                  <td><code className={pageStyles.propName}>{z.zone}</code></td>
                  <td><code className={pageStyles.propType}>{z.range}</code></td>
                  <td><code className={pageStyles.propType}>{z.cssVar || "—"}</code></td>
                  <td>{z.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Hooks</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Hook</th><th>Returns</th><th>Description</th></tr>
            </thead>
            <tbody>
              {HOOKS_TABLE.map((h) => (
                <tr key={h.name}>
                  <td style={{ whiteSpace: "nowrap" }}><code className={pageStyles.propName}>{h.name}</code></td>
                  <td><code className={pageStyles.propType}>{h.returns}</code></td>
                  <td>{h.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Live demo</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          The zone badge and hook values below update in real time as you resize the window.
          Drag the browser narrower than 768 px to reach the mobile zone, or between 768 and 1199 px for tablet.
        </p>
        <ResponsiveDemo />
      </section>

      {CODE_EXAMPLES.map((example, i) => (
        <section key={example.title} className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>{example.title}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
            {example.description}
          </p>
          <div className={pageStyles.story}>
            <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtmls[i]! }} />
          </div>
        </section>
      ))}
    </main>
  );
}
