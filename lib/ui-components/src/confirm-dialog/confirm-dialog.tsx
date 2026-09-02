"use client";

import type { ReactNode } from "react";

import styles from "./confirm-dialog.module.css";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: ReactNode;
  icon?: string;
  size?: "default" | "wide";
  confirmLabel?: string;
  confirmVariant?: "danger" | "primary";
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  icon,
  size = "default",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.backdrop}>
      <div className={`${styles.dialog} ${size === "wide" ? styles.dialogWide : ""}`}>
        <div className={styles.heading}>
          {icon ? (
            <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">
              {icon}
            </span>
          ) : null}
          <h3 className={styles.title}>{title}</h3>
        </div>
        <div className={styles.message}>{message}</div>
        <div className={styles.actions}>
          <button onClick={onClose} className={styles.btnCancel}>Cancel</button>
          <button
            onClick={onConfirm}
            className={confirmVariant === "danger" ? styles.btnConfirmDanger : styles.btnConfirmPrimary}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
