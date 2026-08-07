import { getSingletonHighlighter } from "shiki";
import styles from "../../page.module.css";
import { LeftNavDemo } from "./left-nav-demo";

async function highlight(code: string, lang = "tsx") {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx", "typescript"] });
  return hl.codeToHtml(code, { lang, theme: "github-light" });
}

const PROPS = [
  { name: "groups",        type: "NavGroup[]",                       required: true,  description: "The navigation groups to render. Each group has an optional label and a list of items." },
  { name: "currentPath",   type: "string",                           required: true,  description: "The active URL path. Used to highlight the current item and auto-expand its parent." },
  { name: "onNavigate",    type: "(path: string) => void",           required: true,  description: "Called when the user clicks a nav item." },
  { name: "isCollapsed",   type: "boolean",                          required: true,  description: "Whether the nav is in collapsed (icon-rail) mode." },
  { name: "setIsCollapsed","type": "(collapsed: boolean) => void",   required: true,  description: "Called when the user clicks the collapse/expand toggle." },
  { name: "headerSlot",    type: "React.ReactNode",                  required: false, description: "Optional content rendered above the nav items — used in the main app for the company selector." },
];

const TYPE_CODE = `interface NavItem {
  label: string;
  icon: string;         // Material Symbol name
  path: string;
  exactMatch?: boolean; // Match only the exact path (not prefix)
  children?: NavItem[]; // Renders as expandable sub-menu
}

interface NavGroup {
  label?: string;  // Section heading shown in expanded mode
  items: NavItem[];
}`;

const GROUPS_CODE = `const NAV_GROUPS: NavGroup[] = [
  {
    label: "Components",
    items: [
      { label: "Button",   path: "/",                   icon: "smart_button", exactMatch: true },
      { label: "Checkbox", path: "/components/checkbox", icon: "check_box" },
      // …
    ],
  },
];`;

const CHILDREN_CODE = `// Items with children render as expandable sections.
// Clicking the parent toggles the sub-menu; clicking a leaf navigates.
// Children can themselves have children — nesting is unlimited.
const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      {
        label: "Finance",
        icon: "account_balance",
        path: "/finance",
        children: [
          { label: "Journals", path: "/finance/journals", icon: "menu_book" },
          {
            label: "Subledgers",
            path: "/finance/subledgers",
            icon: "layers",
            children: [
              { label: "Receivable", path: "/finance/subledgers/ar", icon: "call_received" },
              { label: "Payable",    path: "/finance/subledgers/ap", icon: "call_made" },
              {
                label: "Inventory",
                path: "/finance/subledgers/inventory",
                icon: "inventory_2",
                children: [
                  { label: "Items",     path: "/finance/subledgers/inventory/items",     icon: "category" },
                  { label: "Movements", path: "/finance/subledgers/inventory/movements", icon: "swap_horiz" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];`;

const LAYOUT_CODE = `"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LeftNav from "@voyzu/ui-components";
import type { NavGroup } from "@voyzu/ui-components";

// Define once outside the component — stable reference
const NAV_GROUPS: NavGroup[] = [ /* … */ ];

export function SurfaceLeftNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router  = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <LeftNav
        groups={NAV_GROUPS}
        currentPath={pathname ?? "/"}
        onNavigate={(path) => router.push(path)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}`;

const HEADER_SLOT_CODE = `// Pass any React node as headerSlot — rendered above the nav items
// with a separator line below it. The main app passes a company selector.
<LeftNav
  groups={navGroups}
  currentPath={pathname}
  onNavigate={handleNavigate}
  isCollapsed={isCollapsed}
  setIsCollapsed={setIsCollapsed}
  headerSlot={
    <CompanySelector
      isCollapsed={isCollapsed}
      selectedCompany={selectedCompany}
      companies={companies}
      onSelectCompany={setSelectedCompany}
    />
  }
/>`;

export default async function Page() {
  const [typeHtml, groupsHtml, childrenHtml, layoutHtml, headerSlotHtml] = await Promise.all([
    highlight(TYPE_CODE, "typescript"),
    highlight(GROUPS_CODE),
    highlight(CHILDREN_CODE),
    highlight(LAYOUT_CODE),
    highlight(HEADER_SLOT_CODE),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <p className={styles.eyebrow}>Components</p>
        <h1 className={styles.title}>Left Nav</h1>
        <p className={styles.description}>
          Collapsible sidebar navigation. Supports multiple groups, section labels, expandable sub-menus,
          and an optional header slot. The panel on the left of this page is a live example.
        </p>
        <div className={styles.importBlock}>
          <code>import LeftNav from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      {/* Live example callout */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Live example</h2>
        <div className={styles.story}>
          <div className={styles.preview} style={{ flexDirection: "column", gap: "0.5rem", alignItems: "flex-start" }}>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", lineHeight: 1.6 }}>
              The navigation panel on the left <strong>is</strong> this component. Try collapsing it with the
              toggle button on its right edge. Items without a built reference page are listed but navigate to a 404 for now.
            </p>
          </div>
        </div>
      </section>

      {/* Props */}
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

      {/* Types */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Data types</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
          Import from <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>@voyzu/ui-components</code>.
          Both types are also re-exported from the package root index.
        </p>
        <div className={styles.story}>
          <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: typeHtml }} />
        </div>
      </section>

      {/* Defining nav groups */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Defining nav groups</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
          Define <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>NAV_GROUPS</code> as
          a constant outside the component so the reference is stable and avoids unnecessary re-renders.
          Use <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>exactMatch: true</code> on
          items whose path is a prefix of other routes (e.g. <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>/</code>).
        </p>
        <div className={styles.story}>
          <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: groupsHtml }} />
        </div>
      </section>

      {/* Children / sub-menus */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sub-menus (multi-level)</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
          Nest items to any depth using <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>children</code> —
          each child can itself have <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>children</code>.
          Each level is indented progressively in expanded mode, and the entire ancestor chain auto-expands when a descendant route is active.
          In collapsed mode, top-level items with children open a floating panel where nested children can be expanded in place.
        </p>
        <div className={styles.story}>
          <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: childrenHtml }} />
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", margin: "1.5rem 0 0.875rem", lineHeight: 1.6 }}>
          The interactive demo below renders the structure above in a self-contained nav. Drill into
          <strong> Finance &rarr; Subledgers &rarr; Inventory</strong> to see three levels of nesting,
          and try collapsing the rail.
        </p>
        <LeftNavDemo />
      </section>

      {/* Wiring to Next.js */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Wiring to Next.js router</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
          Wrap <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>LeftNav</code> in
          a <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>&quot;use client&quot;</code> layout
          component that reads <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>usePathname</code> and
          delegates navigation to <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>useRouter</code>.
          This is exactly how the left nav on this page is set up.
        </p>
        <div className={styles.story}>
          <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: layoutHtml }} />
        </div>
      </section>

      {/* Header slot */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Header slot</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
          Pass any React node as <code style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.8125rem" }}>headerSlot</code> to
          render content above the nav items with a separator below. The main Voyzu app uses this for the company selector.
          Omit the prop entirely (as this reference app does) to render no header.
        </p>
        <div className={styles.story}>
          <div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: headerSlotHtml }} />
        </div>
      </section>
    </main>
  );
}
