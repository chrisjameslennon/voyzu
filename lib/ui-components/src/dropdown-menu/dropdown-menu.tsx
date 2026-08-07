"use client";

import type React from "react";
import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";

import styles from "./dropdown-menu.module.css";

export type DropdownMenuAlignment = "left" | "right";
export type DropdownMenuWidth = "content" | "trigger" | number;

export interface DropdownMenuItem {
  value: string;
  label: React.ReactNode;
  icon?: string;
  details?: React.ReactNode;
  disabled?: boolean;
  muted?: boolean;
  variant?: "default" | "danger";
  onSelect?: () => void;
  children?: DropdownMenuItem[];
}

interface TriggerRenderProps {
  open: boolean;
  toggle: () => void;
  triggerProps: {
    "aria-expanded": boolean;
    "aria-haspopup": "menu";
    "aria-controls": string;
  };
}

type TriggerElementProps = React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>;

interface DropdownMenuProps {
  trigger: React.ReactElement | ((props: TriggerRenderProps) => React.ReactElement);
  items: DropdownMenuItem[];
  caret?: boolean;
  alignment?: DropdownMenuAlignment;
  width?: DropdownMenuWidth;
  selectedValue?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnSelect?: boolean;
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  caret = false,
  alignment = "left",
  width = "content",
  selectedValue,
  open,
  defaultOpen = false,
  onOpenChange,
  closeOnSelect = true,
  className,
}: DropdownMenuProps) {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const isControlled = open !== undefined;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const toggle = () => setOpen(!isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const triggerProps = {
    "aria-expanded": isOpen,
    "aria-haspopup": "menu" as const,
    "aria-controls": menuId,
  };

  const renderedTrigger =
    typeof trigger === "function"
      ? trigger({ open: isOpen, toggle, triggerProps })
      : trigger;

  const triggerElement = isValidElement<TriggerElementProps>(renderedTrigger)
    ? cloneElement(renderedTrigger, {
        ...triggerProps,
        children: caret ? (
          <>
            {renderedTrigger.props.children}
            <span
              aria-hidden="true"
              className={`material-symbols-outlined ${styles.triggerCaret} ${isOpen ? styles.triggerCaretOpen : ""}`}
            >
              expand_more
            </span>
          </>
        ) : renderedTrigger.props.children,
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          const originalRef = renderedTrigger.props.ref;
          if (typeof originalRef === "function") originalRef(node);
          else if (originalRef && typeof originalRef === "object") originalRef.current = node;
        },
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          renderedTrigger.props.onClick?.(event);
          if (!event.defaultPrevented) toggle();
        },
      })
    : renderedTrigger;

  const menuStyle =
    typeof width === "number"
      ? { width: `${width}px` }
      : undefined;

  const handleSelect = (item: DropdownMenuItem) => {
    if (item.disabled || item.children?.length) return;
    item.onSelect?.();
    if (closeOnSelect) setOpen(false);
  };

  return (
    <div className={`${styles.root}${className ? ` ${className}` : ""}`} ref={rootRef}>
      {triggerElement}

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={`${styles.menu} ${alignment === "left" ? styles.alignLeft : styles.alignRight} ${width === "trigger" ? styles.triggerWidth : ""}`}
          style={menuStyle}
        >
          {items.map((item) => {
            const hasChildren = Boolean(item.children?.length);
            const isSelected = item.value === selectedValue || Boolean(item.children?.some((child) => child.value === selectedValue));
            return (
              <div key={item.value} className={hasChildren ? styles.submenuRoot : undefined}>
                <button
                  type="button"
                  role={hasChildren ? "menuitem" : "menuitemradio"}
                  aria-checked={hasChildren ? undefined : isSelected}
                  aria-haspopup={hasChildren ? "menu" : undefined}
                  className={`${styles.item} ${isSelected ? styles.itemSelected : ""} ${item.variant === "danger" ? styles.itemDanger : ""}`}
                  disabled={item.disabled}
                  onClick={() => handleSelect(item)}
                >
                  {item.icon && <span className={`material-symbols-outlined ${styles.icon}`}>{item.icon}</span>}
                  <span className={`${styles.label} ${item.muted ? styles.labelMuted : ""}`}>{item.label}</span>
                  {item.details && <span className={styles.details}>{item.details}</span>}
                  {hasChildren && <span className={`material-symbols-outlined ${styles.chevron}`}>chevron_right</span>}
                </button>

                {hasChildren && (
                  <div role="menu" className={styles.submenu}>
                    {item.children!.map((child) => (
                      <button
                        key={child.value}
                        type="button"
                        role="menuitem"
                        className={`${styles.item} ${child.variant === "danger" ? styles.itemDanger : ""}`}
                        disabled={child.disabled}
                        onClick={() => handleSelect(child)}
                      >
                        {child.icon && <span className={`material-symbols-outlined ${styles.icon}`}>{child.icon}</span>}
                        <span className={`${styles.label} ${child.muted ? styles.labelMuted : ""}`}>{child.label}</span>
                        {child.details && <span className={styles.details}>{child.details}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
