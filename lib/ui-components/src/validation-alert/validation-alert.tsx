"use client";

import styles from "./validation-alert.module.css";

interface ValidationAlertProps {
  errors: string[];
  visible: boolean;
  onDismiss: () => void;
  className?: string;
}

export function ValidationAlert({ errors, visible, onDismiss, className }: ValidationAlertProps) {
  if (!visible || errors.length === 0) return null;

  return (
    <div className={`${styles.errorAlert} ${className ?? ""}`}>
      <div className={styles.errorContent}>
        <span className="material-symbols-outlined" style={{ color: "var(--voyzu-color-danger)" }}>warning</span>
        <div className={styles.errorList}>
          {errors.map((err, i) => (
            <span key={i} className={styles.errorText}>{err}</span>
          ))}
        </div>
      </div>
      <button onClick={onDismiss} className={styles.errorClose}>
        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
      </button>
    </div>
  );
}
