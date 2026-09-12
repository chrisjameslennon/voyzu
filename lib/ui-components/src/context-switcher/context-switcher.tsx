"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import localStyles from "./context-switcher.module.css";

export interface ContextSwitcherOption {
  id: string;
  name: string;
  subtitle?: string;
  avatar?: ReactNode;
  inactive?: boolean;
  disabled?: boolean;
}

export interface ContextSwitcherProps {
  label: string;
  options: readonly ContextSwitcherOption[];
  selectedId?: string | null;
  /** Returning false keeps the popover open (for example after a failed update). */
  onSelect: (id: string) => void | boolean | Promise<void | boolean>;
  collapsed?: boolean;
  disabled?: boolean;
  placeholder?: string;
  indicatorTone?: "success" | "info";
  emptyMessage?: string;
  headerAction?: ReactNode;
}

export function ContextSwitcher({ label, options, selectedId, onSelect, collapsed = false, disabled = false, indicatorTone = "success", placeholder = `Select ${label}`, emptyMessage = "No options available", headerAction }: ContextSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const selected = options.find((option) => option.id === selectedId);

  useEffect(() => {
    if (!open) return;
    const selectedButton = panelRef.current?.querySelector<HTMLElement>('button[aria-pressed="true"]:not(:disabled)');
    const firstAction = panelRef.current?.querySelector<HTMLElement>('button:not(:disabled), a[href]');
    (selectedButton ?? firstAction)?.focus();
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  const close = () => { setOpen(false); triggerRef.current?.focus(); };
  const select = async (id: string) => {
    setPending(true);
    try {
      if (await onSelect(id) !== false) close();
    } catch {
      // The caller owns error reporting; allow retry without closing the selector.
    } finally { setPending(false); }
  };

  return (
    <div ref={rootRef} className={`${localStyles.context} ${collapsed ? localStyles.contextCollapsed : ""}`}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false); }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) { event.preventDefault(); event.stopPropagation(); close(); }
        if (!open || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
        const buttons = Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]') ?? []);
        if (!buttons.length) return;
        event.preventDefault();
        const index = buttons.indexOf(document.activeElement as HTMLElement);
        const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowUp" ? -1 : 1) + buttons.length) % buttons.length;
        buttons[next]?.focus();
      }}>
      {!collapsed && <div className={localStyles.label}>{label}</div>}
      <button ref={triggerRef} type="button" disabled={disabled} aria-label={`${label}: ${selected?.name ?? placeholder}`}
        aria-expanded={open} aria-controls={open ? panelId : undefined} aria-haspopup="dialog"
        title={collapsed ? selected?.name ?? placeholder : undefined}
        className={`${localStyles.trigger} ${collapsed ? localStyles.triggerCollapsed : ""}`}
        onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === "ArrowDown" && !open) { event.preventDefault(); setOpen(true); } }}>
        <span className={localStyles.triggerLeft}>
          <span aria-hidden="true" className={`${localStyles.dot} ${indicatorTone === "info" ? localStyles.dotInfo : ""} ${selected?.inactive ? localStyles.dotArchived : ""}`} />
          {!collapsed && <span className={localStyles.name}>{selected?.name ?? placeholder}</span>}
        </span>
        {!collapsed && <span aria-hidden="true" className={`material-symbols-outlined ${localStyles.chevron} ${open ? localStyles.chevronOpen : ""}`}>expand_more</span>}
      </button>
      {open && !disabled && <div id={panelId} ref={panelRef} role="dialog" aria-label={placeholder} aria-busy={pending}
        className={`${localStyles.panel} ${collapsed ? localStyles.panelCollapsed : ""}`}>
        {headerAction && <div className={localStyles.headerAction}>{headerAction}</div>}
        <div className={localStyles.panelLabel}>{placeholder}</div>
        {options.length === 0 ? <p role="status">{emptyMessage}</p> : <div className={localStyles.grid}>
          {options.map((option) => <button key={option.id} type="button" aria-pressed={option.id === selectedId}
            disabled={option.disabled} aria-disabled={pending || undefined} onClick={() => { if (!pending) void select(option.id); }}
            className={`${localStyles.option} ${option.id === selectedId ? localStyles.optionActive : ""}`}>
            <span aria-hidden="true" className={localStyles.avatar}>{option.avatar ?? option.name.charAt(0).toUpperCase()}</span>
            <span className={localStyles.optionContent}><span className={localStyles.optionName}>{option.name}</span>
              {option.subtitle && <span className={localStyles.optionMeta}>{option.subtitle}</span>}</span>
          </button>)}
        </div>}
      </div>}
    </div>
  );
}
