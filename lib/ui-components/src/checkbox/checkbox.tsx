"use client";

import type React from "react";
import styles from "./checkbox.module.css";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  checked: boolean;
  invalid?: boolean;
  onChange: (checked: boolean) => void;
}

export function Checkbox({ checked, invalid = false, onChange, ...rest }: CheckboxProps) {
  return (
    <input
      {...rest}
      type="checkbox"
      className={`${styles.checkbox}${invalid ? ` ${styles.invalid}` : ""}`}
      checked={checked}
      aria-invalid={invalid ? true : rest["aria-invalid"]}
      onChange={e => onChange(e.target.checked)}
    />
  );
}
