"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import styles from "./searchable-select.module.css";

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; code?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  hasError?: boolean;
  codeBadge?: boolean;
  showCode?: boolean;
  clearable?: boolean;
  dropdownWidth?: "auto" | "trigger" | number;
  dropdownAlign?: "left" | "right";
  disabled?: boolean;
  className?: string;
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  searchable = true,
  hasError = false,
  codeBadge = true,
  showCode = true,
  clearable = false,
  dropdownWidth = "trigger",
  dropdownAlign = "left",
  disabled = false,
  className,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [panelPos, setPanelPos] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const MIN_PANEL_HEIGHT = 200;

  const toggleOpen = () => {
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
      return;
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const availableBelow = window.innerHeight - rect.bottom - 12;
      const availableAbove = rect.top - 12;
      const openAbove = availableBelow < MIN_PANEL_HEIGHT && availableAbove > availableBelow;
      const maxHeight = Math.min(325, openAbove ? availableAbove : availableBelow);
      const panelWidth = typeof dropdownWidth === "number"
        ? Math.min(dropdownWidth, window.innerWidth - 16)
        : dropdownWidth === "trigger"
          ? rect.width
          : Math.min(rect.width * 1.5, window.innerWidth - 16);
      const panelLeft = dropdownAlign === "right"
        ? Math.max(8, rect.right - panelWidth)
        : Math.min(rect.left, window.innerWidth - panelWidth - 8);
      if (openAbove) {
        setPanelPos({ bottom: window.innerHeight - rect.top + 4, left: panelLeft, width: panelWidth, maxHeight });
      } else {
        setPanelPos({ top: rect.bottom + 4, left: panelLeft, width: panelWidth, maxHeight });
      }
    }
    setSearch("");
    setIsOpen(true);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  // Ref callback for auto-scrolling the selected item into view
  const selectedRefCallback = useCallback((node: HTMLButtonElement | null) => {
    if (node) {
      node.scrollIntoView({ block: "nearest" });
    }
  }, []);

  const filtered = searchable
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(search.toLowerCase()) ||
          o.value.toLowerCase().includes(search.toLowerCase()) ||
          (o.code?.toLowerCase().includes(search.toLowerCase()) ?? false),
      )
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        ref={triggerRef}
        onClick={toggleOpen}
        disabled={disabled}
        className={`${styles.trigger} ${isOpen ? styles.triggerOpen : ""} ${hasError ? styles.inputError : ""} ${disabled ? styles.triggerDisabled : ""} ${className ?? ""}`}
      >
        <span className={value ? styles.triggerValue : styles.triggerPlaceholder}>
          {selectedLabel ?? placeholder}
        </span>
        {clearable && value && (
          <span
            role="button"
            className={styles.clearBtn}
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            tabIndex={-1}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
          </span>
        )}
        <span className="material-symbols-outlined">expand_more</span>
      </button>

      {isOpen && panelPos && (
        <div
          className={styles.panel}
          style={{ top: panelPos.top, bottom: panelPos.bottom, left: panelPos.left, width: panelPos.width, maxHeight: panelPos.maxHeight }}
        >
          {searchable && (
            <div className={styles.search}>
              <input
                ref={searchInputRef}
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className={styles.list}>
            {filtered.length > 0 ? (
              filtered.map((o) => {
                const isSelected = o.value === value;
                return (
                  <button
                    type="button"
                    key={o.value}
                    ref={isSelected ? selectedRefCallback : undefined}
                    className={`${styles.option} ${isSelected ? styles.optionSelected : ""}`}
                    onClick={() => handleSelect(o.value)}
                  >
                    <span>{o.label}</span>
                    <span className={styles.optionRight}>
                      {o.code && showCode && <span className={codeBadge ? styles.optionCodeBadge : styles.optionCode}>{o.code}</span>}
                      <span className={styles.checkSlot}>
                        {isSelected && (
                          <span className={`material-symbols-outlined ${styles.checkmark}`}>check</span>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className={styles.empty}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
