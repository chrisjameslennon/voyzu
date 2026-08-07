import type React from "react";

import styles from "./badge.module.css";

export type BadgeVariant = "soft" | "solid" | "outline";
export type BadgeSize = "x-small" | "small" | "medium" | "large" | "x-large";
export type BadgeColor = "info" | "success" | "warning" | "danger" | "neutral" | "plain";

export interface BadgeCustomColors {
  fg: string;
  bg: string;
  border: string;
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  size: BadgeSize;
  color?: BadgeColor;
  customColors?: BadgeCustomColors;
  icon?: string;
}

const variantClass: Record<BadgeVariant, string> = {
  soft: styles.soft,
  solid: styles.solid,
  outline: styles.outline,
};

const sizeClass: Record<BadgeSize, string> = {
  "x-small": styles.xSmall,
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
  "x-large": styles.xLarge,
};

const colorClass: Record<BadgeColor, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  danger: styles.danger,
  neutral: styles.neutral,
  plain: styles.plain,
};

type BadgeStyle = React.CSSProperties & {
  "--badge-bg"?: string;
  "--badge-text"?: string;
  "--badge-border"?: string;
  "--badge-solid-bg"?: string;
};

export function Badge({ variant, size, color = "neutral", customColors, icon, className, children, style, ...rest }: BadgeProps) {
  const customStyle: BadgeStyle | undefined = customColors
    ? {
        "--badge-bg": customColors.bg,
        "--badge-text": customColors.fg,
        "--badge-border": customColors.border,
        "--badge-solid-bg": customColors.bg,
        ...style,
      }
    : style;

  return (
    <span
      className={`${styles.badge} ${variantClass[variant]} ${sizeClass[size]} ${colorClass[color]}${icon ? ` ${styles.withIcon}` : ""}${className ? ` ${className}` : ""}`}
      style={customStyle}
      {...rest}
    >
      {icon && <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
