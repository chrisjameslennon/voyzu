"use client";

import { useState } from "react";
import { LeftNav, type NavGroup } from "@voyzu/ui-components";

const DEMO_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", path: "/demo/dashboard", icon: "dashboard" },
      {
        label: "Finance",
        icon: "account_balance",
        path: "/demo/finance",
        children: [
          { label: "Journals", path: "/demo/finance/journals", icon: "menu_book" },
          {
            label: "Subledgers",
            path: "/demo/finance/subledgers",
            icon: "layers",
            children: [
              { label: "Receivable", path: "/demo/finance/subledgers/ar", icon: "call_received" },
              { label: "Payable",    path: "/demo/finance/subledgers/ap", icon: "call_made" },
              {
                label: "Inventory",
                path: "/demo/finance/subledgers/inventory",
                icon: "inventory_2",
                children: [
                  { label: "Items",     path: "/demo/finance/subledgers/inventory/items",     icon: "category" },
                  { label: "Movements", path: "/demo/finance/subledgers/inventory/movements", icon: "swap_horiz" },
                ],
              },
            ],
          },
          { label: "Reports", path: "/demo/finance/reports", icon: "summarize" },
        ],
      },
      {
        label: "Settings",
        icon: "settings",
        path: "/demo/settings",
        children: [
          { label: "Users", path: "/demo/settings/users", icon: "group" },
          { label: "Roles", path: "/demo/settings/roles", icon: "badge" },
        ],
      },
    ],
  },
];

export function LeftNavDemo() {
  const [path, setPath] = useState("/demo/finance/subledgers/ar");
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "32rem",
        border: "1px solid var(--voyzu-color-border)",
        borderRadius: 8,
        overflow: "hidden",
        background: "var(--voyzu-color-surface)",
      }}
    >
      <LeftNav
        groups={DEMO_GROUPS}
        currentPath={path}
        onNavigate={setPath}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <div
        style={{
          flex: 1,
          padding: "1.5rem 2rem",
          background: "var(--voyzu-color-surface-muted)",
          overflowY: "auto",
        }}
      >
        <p
          style={{
            margin: "0 0 0.375rem",
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            color: "var(--voyzu-color-text-tertiary)",
          }}
        >
          Active path
        </p>
        <code
          style={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: "0.9375rem",
            color: "var(--voyzu-color-brand)",
            fontWeight: 600,
          }}
        >
          {path}
        </code>
        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            color: "var(--voyzu-color-text-secondary)",
          }}
        >
          Click <strong>Finance &rarr; Subledgers &rarr; Inventory</strong> to drill three levels deep. Parent items
          auto-expand to reveal the active route. Toggle the rail on the right edge of the nav to see how nested
          children render in a floating panel when collapsed.
        </p>
      </div>
    </div>
  );
}
