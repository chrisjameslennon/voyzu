"use client";

import type { TextareaHTMLAttributes } from "react";
import localStyles from "./textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

/** Disabled values remain selectable and copyable, matching Input. */
export function Textarea({ disabled, readOnly, invalid = false, className, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      readOnly={disabled || readOnly}
      aria-disabled={disabled || undefined}
      aria-invalid={invalid || props["aria-invalid"]}
      className={[localStyles.textarea, disabled ? localStyles.disabled : "", invalid ? localStyles.invalid : "", className].filter(Boolean).join(" ")}
    />
  );
}
