"use client";

import type React from "react";
import styles from "./button.module.css";

export type ButtonVariant = "primary" | "secondary" | "secondary-destructive" | "plain" | "cancel" | "danger";
export type ButtonTextAlign = "left" | "center";
export type ButtonSize = "medium" | "small";

const variantClass: Record<ButtonVariant, string> = {
  primary: styles.primary,
  secondary: styles.secondary,
  "secondary-destructive": styles.secondaryDestructive,
  plain: styles.plain,
  cancel: styles.cancel,
  danger: styles.danger,
};

const sizeClass: Record<ButtonSize, string> = {
  medium: styles.medium,
  small: styles.small,
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: ButtonVariant;
  icon?: string;
  size?: ButtonSize;
  textAlign?: ButtonTextAlign;
}

export function Button({ variant, icon, children, className, size = "medium", textAlign = "left", ...rest }: ButtonProps) {
  const alignClass = textAlign === "center" ? styles.textCenter : styles.textLeft;

  return (
    <button
      className={`${styles.btn} ${variantClass[variant]} ${sizeClass[size]} ${alignClass}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {children}
    </button>
  );
}
