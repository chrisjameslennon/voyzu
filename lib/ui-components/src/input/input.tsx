"use client";

import { useId, useState } from "react";
import type React from "react";
import styles from "./input.module.css";

export type InputIconPosition = "left" | "right";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "readOnly"> {
  badge?: React.ReactNode;
  containerClassName?: string;
  invalid?: boolean;
  password?: boolean;
  search?: boolean;
  position?: InputIconPosition;
}

export function Input({
  badge,
  className,
  containerClassName,
  disabled,
  id,
  invalid = false,
  password = false,
  position = "left",
  search = false,
  type = "text",
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasLeadingIcon = search && position === "left";
  const hasTrailingSearchIcon = search && position === "right" && !password;
  const hasPasswordToggle = password;

  const inputType = password ? (isPasswordVisible ? "text" : "password") : type;

  return (
    <div
      className={[
        styles.wrapper,
        hasLeadingIcon ? styles.withLeadingIcon : "",
        hasTrailingSearchIcon || hasPasswordToggle ? styles.withTrailingIcon : "",
        badge ? styles.withBadge : "",
        containerClassName ?? "",
      ].filter(Boolean).join(" ")}
    >
      {hasLeadingIcon && (
        <span className={`material-symbols-outlined ${styles.icon} ${styles.leadingIcon}`} aria-hidden="true">
          search
        </span>
      )}
      <input
        {...props}
        id={inputId}
        type={inputType}
        readOnly={disabled}
        aria-disabled={disabled || undefined}
        aria-invalid={invalid ? true : props["aria-invalid"]}
        className={[
          styles.input,
          disabled ? styles.disabled : "",
          invalid ? styles.invalid : "",
          className ?? "",
        ].filter(Boolean).join(" ")}
      />
      {badge && (
        <span className={styles.badge} aria-hidden="true">
          {badge}
        </span>
      )}
      {hasTrailingSearchIcon && (
        <span className={`material-symbols-outlined ${styles.icon} ${styles.trailingIcon}`} aria-hidden="true">
          search
        </span>
      )}
      {hasPasswordToggle && (
        <button
          type="button"
          className={`${styles.iconButton} ${styles.trailingIcon}`}
          aria-controls={inputId}
          aria-label={isPasswordVisible ? "Hide password" : "Show password"}
          disabled={disabled}
          onClick={() => setIsPasswordVisible((current) => !current)}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            {isPasswordVisible ? "visibility_off" : "visibility"}
          </span>
        </button>
      )}
    </div>
  );
}
