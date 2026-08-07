"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./split-button.module.css";

type SplitButtonVariant = "primary" | "secondary";

export interface SplitButtonItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

interface SplitButtonProps {
  variant?: SplitButtonVariant;
  label: string;
  icon?: string;
  onClick: () => void;
  items: SplitButtonItem[];
  disabled?: boolean;
}

const groupClass: Record<SplitButtonVariant, string> = {
  primary: styles.groupPrimary,
  secondary: styles.groupSecondary,
};

export function SplitButton({ variant = "primary", label, icon, onClick, items, disabled }: SplitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [isOpen]);

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={`${styles.group} ${groupClass[variant]}`}>
        <button className={styles.main} onClick={onClick} disabled={disabled}>
          {icon && <span className="material-symbols-outlined">{icon}</span>}
          {label}
        </button>
        <div className={styles.divider} />
        <button
          className={styles.toggle}
          onClick={() => setIsOpen((v) => !v)}
          disabled={disabled}
          aria-label="More options"
        >
          <span className="material-symbols-outlined">arrow_drop_down</span>
        </button>
      </div>
      {isOpen && (
        <div className={styles.dropdown}>
          {items.map((item) => (
            <button
              key={item.label}
              className={styles.dropdownItem}
              onClick={() => { setIsOpen(false); item.onClick(); }}
            >
              {item.icon && <span className="material-symbols-outlined">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
