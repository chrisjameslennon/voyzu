"use client";

import React, { useState } from "react";
import { getRandomDeterministicColor } from "@voyzu/ui-style";
import { type NavItem } from "../lib/types/nav-types";
import styles from "./mobile-nav-drawer.module.css";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Company {
  id: number;
  code?: string;
  name: string;
}

export interface DrawerNavSection {
  sectionLabel?: string;
  items: NavItem[];
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  domains: string[];
  activeDomain: string;
  onSelectDomain: (domain: string) => void;
  navSections: DrawerNavSection[];
  currentPath: string;
  onNavigate: (path: string) => void;
  selectedCompany?: Company | null;
  companies?: Company[];
  onSelectCompany?: (company: Company) => void;
  showCompanySelector?: boolean;
  logoSrc?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MobileNavDrawer({
  isOpen,
  onClose,
  domains,
  activeDomain,
  onSelectDomain,
  navSections,
  currentPath,
  onNavigate,
  selectedCompany,
  companies,
  onSelectCompany,
  showCompanySelector,
  logoSrc,
}: MobileNavDrawerProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  };

  const handleNavItemClick = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      toggleExpand(item.label);
    } else {
      onNavigate(item.path);
      onClose();
    }
  };

  const renderNavItem = (item: NavItem, isChild = false, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const isActive = currentPath === item.path;
    const itemKey = `${depth}:${item.label}:${item.path}`;

    if (isChild) {
      return (
        <div key={itemKey}>
          <button
            onClick={() => handleNavItemClick(item)}
            className={`${styles.navChild} ${isActive ? styles.navChildActive : ""}`}
          >
            {item.label}
          </button>
        </div>
      );
    }

    return (
      <div key={itemKey}>
        <button
          onClick={() => handleNavItemClick(item)}
          className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
        >
          {item.icon && (
            <span className={`material-symbols-outlined ${styles.navIcon} ${isActive ? styles.navIconActive : ""}`}>
              {item.icon}
            </span>
          )}
          <span className={styles.navLabel}>{item.label}</span>
          {hasChildren && (
            <span className={`material-symbols-outlined ${styles.navChevron} ${isExpanded ? styles.navChevronOpen : ""}`}>
              expand_more
            </span>
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className={styles.navChildren}>
            {item.children?.map((child) => renderNavItem(child, true, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brand}>
            {logoSrc && (
              <img src={logoSrc} alt="Logo" className={styles.brandLogo} />
            )}
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable body */}
        <div className={styles.scrollArea}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Domains</div>
            {domains.map((domain) => (
              <button
                key={domain}
                onClick={() => {
                  onSelectDomain(domain);
                  onClose();
                }}
                className={`${styles.domainItem} ${activeDomain === domain ? styles.domainItemActive : ""}`}
              >
                {domain}
              </button>
            ))}
          </div>

          <div className={styles.divider} />

          {/* Company selector */}
          {showCompanySelector && companies && companies.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Active Company</div>
              <button
                className={styles.companyTrigger}
                onClick={() => setIsCompanyDropdownOpen((o) => !o)}
              >
                <div className={styles.companyTriggerLeft}>
                  {selectedCompany && (() => {
                    const color = getRandomDeterministicColor(selectedCompany.code ?? selectedCompany.name);
                    return (
                      <div
                        className={styles.companyAvatar}
                        style={{ background: color.bg, color: color.fg }}
                      >
                        {selectedCompany.name.charAt(0)}
                      </div>
                    );
                  })()}
                  <span className={styles.companyTriggerName}>
                    {selectedCompany?.name ?? "Select company"}
                  </span>
                </div>
                <span className={`material-symbols-outlined ${styles.chevronIcon} ${isCompanyDropdownOpen ? styles.chevronIconOpen : ""}`}>
                  expand_more
                </span>
              </button>

              {isCompanyDropdownOpen && (
                <div className={styles.companyDropdown}>
                  {companies.map((company) => {
                    const isActive = selectedCompany?.id === company.id;
                    const color = getRandomDeterministicColor(company.code ?? company.name);
                    return (
                      <button
                        key={company.id}
                        onClick={() => {
                          onSelectCompany?.(company);
                          setIsCompanyDropdownOpen(false);
                          onClose();
                        }}
                        className={`${styles.companyOption} ${isActive ? styles.companyOptionActive : ""}`}
                      >
                        <div
                          className={styles.companyDot}
                          style={{ background: color.fg }}
                        />
                        {company.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Domain nav */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>{activeDomain} Menu</div>
            {navSections.map((section, i) => (
              <div key={i}>
                {section.sectionLabel && (
                  <div className={styles.subSectionLabel}>{section.sectionLabel}</div>
                )}
                {section.items.map((item) => renderNavItem(item))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
