"use client";

import type React from "react";
import { useState } from "react";

import styles from "./alert.module.css";

export type AlertVariant = "soft" | "solid" | "outline";
export type AlertColor = "brand" | "info" | "success" | "warning" | "danger" | "neutral" | "plain";

interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant: AlertVariant;
  color: AlertColor;
  title: React.ReactNode;
  text: React.ReactNode;
  dismissable?: boolean;
}

const variantClass: Record<AlertVariant, string> = {
  soft: styles.soft,
  solid: styles.solid,
  outline: styles.outline,
};

const colorClass: Record<AlertColor, string> = {
  brand: styles.brand,
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  neutral: styles.neutral,
  plain: styles.plain,
};

export function Alert({ variant, color, title, text, dismissable = false, className, children, ...rest }: AlertProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={`${styles.alert} ${variantClass[variant]} ${colorClass[color]}${className ? ` ${className}` : ""}`} {...rest}>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.text}>{text}</div>
        {children}
      </div>
      {dismissable && (
        <button type="button" className={styles.close} onClick={() => setDismissed(true)} aria-label="Dismiss alert">
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      )}
    </div>
  );
}
