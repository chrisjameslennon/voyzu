"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import styles from "./tab-group.module.css";

export interface TabDef {
  key: string;
  label: string;
  disabled?: boolean;
  content: ReactNode;
}

interface TabGroupProps {
  tabs: TabDef[];
  defaultKey?: string;
  activeKey?: string;
  variant?: "default" | "compact";
  onChange?: (key: string) => void;
}

export function TabGroup({ tabs, defaultKey, activeKey, variant = "default", onChange }: TabGroupProps) {
  const [internalKey, setInternalKey] = useState<string>(defaultKey ?? tabs[0]?.key ?? "");
  const current = activeKey ?? internalKey;
  const activeTab = tabs.find((t) => t.key === current) ?? tabs[0];

  const select = (key: string) => {
    if (activeKey === undefined) setInternalKey(key);
    onChange?.(key);
  };

  return (
    <div className={`${styles.tabGroup} ${variant === "compact" ? styles.compact : ""}`}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab?.key;
          const className = [
            styles.tab,
            isActive ? styles.tabActive : "",
            tab.disabled ? styles.tabDisabled : "",
          ].filter(Boolean).join(" ");
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              className={className}
              onClick={() => !tab.disabled && select(tab.key)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className={styles.panel} role="tabpanel">
        {activeTab?.content}
      </div>
    </div>
  );
}
