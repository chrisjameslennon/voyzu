"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { Checkbox } from "../checkbox/checkbox";
import styles from "./searchable-select.module.css";

export interface SearchableSelectOption {
  value: string;
  label: string;
  code?: string;
}

interface SearchableSelectBaseProps {
  options: SearchableSelectOption[];
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
  gridStyling?: boolean;
  className?: string;
  id?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
}

export interface SearchableSingleSelectProps extends SearchableSelectBaseProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

export interface SearchableMultiSelectProps extends SearchableSelectBaseProps {
  multiple: true;
  value: string[];
  onChange: (values: string[]) => void;
}

export type SearchableSelectProps = SearchableSingleSelectProps | SearchableMultiSelectProps;

export function SearchableSelect(props: SearchableSelectProps) {
  const {
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
    gridStyling = false,
    className,
    ariaLabel,
    ariaLabelledBy,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [panelPos, setPanelPos] = useState<{ top?: number; bottom?: number; left: number; width: number; maxHeight: number } | null>(null);

  const generatedId = useId();
  const id = props.id ?? `searchable-select-${generatedId.replace(/:/g, "")}`;
  const panelId = `${id}-panel`;
  const listId = `${id}-list`;
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLElement | null>>([]);

  const selectedValues = props.multiple ? props.value : props.value ? [props.value] : [];
  const selectedSet = new Set(selectedValues);
  const selectedOptions = options.filter((option) => selectedSet.has(option.value));
  const filtered = searchable
    ? options.filter((option) => {
        const query = search.toLowerCase();
        return option.label.toLowerCase().includes(query)
          || option.value.toLowerCase().includes(query)
          || (option.code?.toLowerCase().includes(query) ?? false);
      })
    : options;

  const activeOptionId = activeIndex >= 0 && filtered[activeIndex]
    ? `${id}-option-${activeIndex}`
    : undefined;

  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    setActiveIndex(-1);
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) close();
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [close]);

  useEffect(() => {
    if (!isOpen) return;
    const firstSelectedIndex = filtered.findIndex((option) => selectedSet.has(option.value));
    setActiveIndex(firstSelectedIndex >= 0 ? firstSelectedIndex : filtered.length ? 0 : -1);

    requestAnimationFrame(() => {
      if (searchable) {
        searchInputRef.current?.focus();
      } else if (props.multiple) {
        const target = optionRefs.current[firstSelectedIndex >= 0 ? firstSelectedIndex : 0];
        target?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.focus();
      } else {
        optionRefs.current[firstSelectedIndex >= 0 ? firstSelectedIndex : 0]?.focus();
      }
    });
    // Selection is deliberately sampled only when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchable]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex((current) => current >= filtered.length ? filtered.length - 1 : current);
  }, [filtered.length, isOpen]);

  const MIN_PANEL_HEIGHT = 200;

  const open = () => {
    if (disabled || isOpen) return;
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
      setPanelPos(openAbove
        ? { bottom: window.innerHeight - rect.top + 4, left: panelLeft, width: panelWidth, maxHeight }
        : { top: rect.bottom + 4, left: panelLeft, width: panelWidth, maxHeight });
    }
    setSearch("");
    setIsOpen(true);
  };

  const toggleOpen = () => {
    if (isOpen) close();
    else open();
  };

  const selectOption = (optionValue: string) => {
    if (props.multiple) {
      props.onChange(props.value.includes(optionValue)
        ? props.value.filter((value) => value !== optionValue)
        : [...props.value, optionValue]);
      return;
    }
    props.onChange(optionValue);
    close(true);
  };

  const clear = () => {
    if (props.multiple) props.onChange([]);
    else props.onChange("");
  };

  const focusOption = (index: number) => {
    if (!filtered.length) return;
    const nextIndex = (index + filtered.length) % filtered.length;
    setActiveIndex(nextIndex);
    const target = optionRefs.current[nextIndex];
    if (props.multiple) target?.querySelector<HTMLInputElement>('input[type="checkbox"]')?.focus();
    else target?.focus();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (props.multiple) focusOption(activeIndex + 1);
      else setActiveIndex((current) => Math.min(current + 1, filtered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      if (props.multiple) focusOption(activeIndex <= 0 ? filtered.length - 1 : activeIndex - 1);
      else setActiveIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0 && filtered[activeIndex]) {
      event.preventDefault();
      selectOption(filtered[activeIndex].value);
    }
  };

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(filtered.length - 1);
    }
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      open();
    }
  };

  const triggerText = props.multiple
    ? selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
        ? selectedOptions[0]!.label
        : `${selectedOptions.length} selected`
    : selectedOptions[0]?.label ?? placeholder;
  const hasValue = selectedValues.length > 0;

  return (
    <div
      ref={wrapRef}
      className={`${styles.root} ${gridStyling ? styles.gridRoot : ""}`}
    >
      <button
        type="button"
        id={id}
        ref={triggerRef}
        onClick={toggleOpen}
        onKeyDown={handleTriggerKeyDown}
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? panelId : undefined}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-invalid={hasError || undefined}
        className={`${styles.trigger} ${gridStyling ? styles.gridTrigger : ""} ${isOpen ? styles.triggerOpen : ""} ${hasError ? styles.inputError : ""} ${disabled ? styles.triggerDisabled : ""} ${clearable && hasValue ? styles.triggerClearable : ""} ${className ?? ""}`}
      >
        <span className={hasValue ? styles.triggerValue : styles.triggerPlaceholder}>{triggerText}</span>
      </button>

      {clearable && hasValue && !disabled && (
        <button type="button" className={styles.clearBtn} aria-label="Clear selection" onClick={clear}>
          <span className="material-symbols-outlined" style={{ fontSize: "12.6px" }} aria-hidden="true">close</span>
        </button>
      )}
      <span className={`material-symbols-outlined ${styles.chevron} ${disabled ? styles.chevronDisabled : ""}`} aria-hidden="true">expand_more</span>

      {isOpen && panelPos && (
        <div
          id={panelId}
          role="dialog"
          aria-label={ariaLabel ?? (props.multiple ? "Choose options" : "Choose an option")}
          className={`${styles.panel} ${gridStyling ? styles.gridPanel : ""}`}
          style={{ top: panelPos.top, bottom: panelPos.bottom, left: panelPos.left, width: panelPos.width, maxHeight: panelPos.maxHeight }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              close(true);
            }
          }}
        >
          {searchable && (
            <div className={styles.search}>
              <input
                ref={searchInputRef}
                role={props.multiple ? "searchbox" : "combobox"}
                aria-label={searchPlaceholder}
                aria-autocomplete={props.multiple ? undefined : "list"}
                aria-expanded={props.multiple ? undefined : true}
                aria-controls={listId}
                aria-activedescendant={!props.multiple ? activeOptionId : undefined}
                className={`${styles.searchInput} ${gridStyling ? styles.gridSearchInput : ""}`}
                placeholder={searchPlaceholder}
                value={search}
                onChange={(event) => { setSearch(event.target.value); setActiveIndex(0); }}
                onKeyDown={handleSearchKeyDown}
              />
            </div>
          )}
          <div
            id={listId}
            role={props.multiple ? "group" : "listbox"}
            aria-label={props.multiple ? "Options" : undefined}
            className={styles.list}
          >
            {filtered.length > 0 ? filtered.map((option, index) => {
              const isSelected = selectedSet.has(option.value);
              const optionId = `${id}-option-${index}`;

              if (props.multiple) {
                return (
                  <label
                    key={option.value}
                    ref={(node) => { optionRefs.current[index] = node; }}
                    className={`${styles.option} ${styles.multiOption} ${isSelected ? styles.optionSelected : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  >
                    <Checkbox checked={isSelected} onChange={() => selectOption(option.value)} />
                    <span className={styles.optionLabel}>{option.label}</span>
                    {option.code && showCode && <span className={codeBadge ? styles.optionCodeBadge : styles.optionCode}>{option.code}</span>}
                  </label>
                );
              }

              return (
                <button
                  type="button"
                  id={optionId}
                  role="option"
                  aria-selected={isSelected}
                  key={option.value}
                  ref={(node) => { optionRefs.current[index] = node; }}
                  className={`${styles.option} ${isSelected ? styles.optionSelected : ""} ${activeIndex === index ? styles.optionActive : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  onClick={() => selectOption(option.value)}
                >
                  <span>{option.label}</span>
                  <span className={styles.optionRight}>
                    {option.code && showCode && <span className={codeBadge ? styles.optionCodeBadge : styles.optionCode}>{option.code}</span>}
                    <span className={styles.checkSlot}>
                      {isSelected && <span className={`material-symbols-outlined ${styles.checkmark}`} aria-hidden="true">check</span>}
                    </span>
                  </span>
                </button>
              );
            }) : (
              <div className={styles.empty}>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
