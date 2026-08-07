"use client";

import { useState } from "react";
import { MobileNavDrawer } from "@voyzu/ui-components";
import type { NavItem } from "@voyzu/ui-components";

const DOMAINS = ["Finance", "Organization", "Accounts", "Security"];

const FINANCE_ITEMS: NavItem[] = [
  { label: "Dashboard",  icon: "dashboard",    path: "/finance" },
  { label: "Journals",   icon: "menu_book",    path: "/finance/journals" },
  { label: "Invoices",   icon: "receipt_long", path: "/finance/invoices" },
  { label: "Bills",      icon: "payments",     path: "/finance/bills" },
  { label: "Payments",   icon: "credit_card",  path: "/finance/payments" },
];

const REPORTS_ITEMS: NavItem[] = [
  { label: "Trial Balance", icon: "balance",      path: "/finance/reports/trial-balance" },
  { label: "Profit & Loss", icon: "trending_up",  path: "/finance/reports/pnl" },
  { label: "Balance Sheet", icon: "account_tree", path: "/finance/reports/balance-sheet" },
];

const ORG_ITEMS: NavItem[] = [
  { label: "Companies",         icon: "business",          path: "/org/companies" },
  { label: "Currencies",        icon: "currency_exchange", path: "/org/currencies" },
  { label: "Tax Codes",         icon: "receipt",           path: "/org/tax-codes" },
  { label: "Chart of Accounts", icon: "account_tree",      path: "/org/coa" },
];

const COMPANIES = [
  { id: 1, name: "Acme Corporation" },
  { id: 2, name: "Globex Industries" },
  { id: 3, name: "Initech Ltd" },
];

export function MobileNavDrawerPreview() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDomain, setActiveDomain] = useState("Finance");
  const [selectedCompany, setSelectedCompany] = useState(COMPANIES[0]!);

  const navSections =
    activeDomain === "Finance"
      ? [{ items: FINANCE_ITEMS }, { sectionLabel: "Reports", items: REPORTS_ITEMS }]
      : activeDomain === "Organization"
        ? [{ sectionLabel: "Settings", items: ORG_ITEMS }]
        : [{ items: [] }];

  return (
    /*
     * transform: translate(0) creates a new containing block for position:fixed children.
     * This constrains the drawer overlay to this box instead of the full viewport,
     * so it aligns with the preview area rather than painting over the left nav.
     */
    <div
      style={{
        position: "relative",
        transform: "translate(0)",
        height: 560,
        overflow: "hidden",
        border: "1px solid var(--voyzu-color-border)",
        borderRadius: 8,
        background: "var(--voyzu-color-surface-muted)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Simulated mobile top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0 1rem",
          height: "3.5rem",
          background: "var(--voyzu-color-text-heading)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "2.25rem",
            height: "2.25rem",
            border: "none",
            borderRadius: 6,
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>menu</span>
        </button>
        <span style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#fff", fontFamily: "var(--voyzu-font-family)" }}>
          {activeDomain}
        </span>
      </div>

      {/* Simulated page content */}
      <div style={{ flex: 1, padding: "1.5rem 1rem" }}>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)" }}>
          Tap the hamburger icon to open the drawer. Switch domains, toggle the company selector, and expand nav items with children.
        </p>
      </div>

      <MobileNavDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        domains={DOMAINS}
        activeDomain={activeDomain}
        onSelectDomain={(d) => { setActiveDomain(d); setIsOpen(true); }}
        navSections={navSections}
        currentPath="/finance/journals"
        onNavigate={() => setIsOpen(false)}
        selectedCompany={selectedCompany}
        companies={COMPANIES}
        onSelectCompany={(c) => { setSelectedCompany(c); }}
        showCompanySelector={activeDomain === "Finance" || activeDomain === "Accounts"}
        logoSrc="/voyzu/voyzu_color_logo_transparent.png"
      />
    </div>
  );
}
