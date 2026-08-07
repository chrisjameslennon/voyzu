"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { computeErrors, fieldHasError } from "./validation-rules";
import type { FieldDescriptor } from "./validation-rules";

export type {
  FieldDescriptor,
  FieldRule,
  FormatRule,
  RequiredRule,
} from "./validation-rules";
export {
  maxLength,
  minLength,
  pattern,
  required,
} from "./validation-rules";

export function useFormValidation(getFields: () => Record<string, FieldDescriptor>) {
  const [attempted, setAttempted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const fields = getFields();
  const errors = computeErrors(fields);
  const errorsKey = errors.join("|");

  useEffect(() => {
    setDismissed(false);
  }, [errorsKey]);

  const errorsRef = useRef(errors);
  errorsRef.current = errors;

  const attempt = useCallback((): boolean => {
    setAttempted(true);
    setDismissed(false);
    return errorsRef.current.length === 0;
  }, []);

  const reset = useCallback(() => {
    setAttempted(false);
    setDismissed(false);
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

  const hasError = (fieldName: string): boolean => {
    if (!attempted) return false;
    const field = fields[fieldName];
    if (!field || field.enabled === false) return false;
    return fieldHasError(field);
  };

  return {
    errors,
    showErrors: attempted && errors.length > 0 && !dismissed,
    attempt,
    reset,
    dismiss,
    hasError,
    isValid: errors.length === 0,
  };
}
