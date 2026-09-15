"use client";

import { useEffect, useId, useRef, useState } from "react";
import type React from "react";
import styles from "./input.module.css";

export type InputIconPosition = "left" | "right";

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "readOnly"> {
  /** Fixed decimal display and maximum fractional digits. Uses text input with a decimal keyboard.
   * onChange receives the editing string; use Number(value), not valueAsNumber.
   * Empty values stay empty. Numeric values format on initial display and blur.
   */
  decimalPlaces?: number;
  badge?: React.ReactNode;
  containerClassName?: string;
  invalid?: boolean;
  password?: boolean;
  search?: boolean;
  position?: InputIconPosition;
}

export function Input({
  badge,
  decimalPlaces,
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
  if (decimalPlaces !== undefined && (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > 20)) {
    throw new RangeError("Input decimalPlaces must be an integer from 0 to 20.");
  }
  const decimal = decimalPlaces !== undefined && !password;
  const formatDecimal = (value: unknown) => {
    if (value === undefined || value === null || String(value).trim() === "") return "";
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(decimalPlaces) : "";
  };
  const [draft, setDraft] = useState(() => decimal ? formatDecimal(props.value ?? props.defaultValue) : "");
  const focused = useRef(false);
  useEffect(() => {
    if (!decimal || props.value === undefined) return;
    setDraft((current) => {
      const incoming = String(props.value ?? "");
      if (focused.current && (current === incoming || (current !== "" && incoming !== "" && Number(current) === Number(incoming)))) return current;
      return focused.current ? incoming : formatDecimal(props.value);
    });
  }, [props.value, decimalPlaces, decimal]);
  const decimalProps: React.InputHTMLAttributes<HTMLInputElement> = decimal ? {
    value: draft,
    defaultValue: undefined,
    inputMode: "decimal",
    onFocus: (event) => { focused.current = true; props.onFocus?.(event); },
    onChange: (event) => {
      const next = event.target.value;
      const sign = props.min !== undefined && Number(props.min) >= 0 ? "" : "-?";
      const expression = new RegExp("^" + sign + (decimalPlaces === 0 ? "[0-9]*" : "[0-9]*(?:[.][0-9]{0," + decimalPlaces + "})?") + "$");
      if (!expression.test(next)) return;
      setDraft(next);
      props.onChange?.(event);
    },
    onBlur: (event) => {
      focused.current = false;
      const formatted = formatDecimal(event.target.value);
      setDraft(formatted);
      event.target.value = formatted;
      props.onBlur?.(event);
    },
  } : {};
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const hasLeadingIcon = search && position === "left";
  const hasTrailingSearchIcon = search && position === "right" && !password;
  const hasPasswordToggle = password;

  const inputType = password ? (isPasswordVisible ? "text" : "password") : decimal ? "text" : type;

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
        {...decimalProps}
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
