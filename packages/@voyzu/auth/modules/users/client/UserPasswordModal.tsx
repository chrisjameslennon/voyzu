"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@voyzu/ui-style/css-modules/modal.module.css";
import { Button } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import { ValidationAlert } from "@voyzu/ui-components";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import { minLength, required, useFormValidation } from "@voyzu/ui-components";

export interface UserPasswordValue {
  password: string;
  confirmPassword: string;
}

interface Props {
  isOpen: boolean;
  minimumLength?: number;
  onClose: () => void;
  onSubmit: (value: UserPasswordValue) => Promise<string | undefined>;
}

const DEFAULT_VALUE: UserPasswordValue = {
  password: "",
  confirmPassword: "",
};

export function UserPasswordModal({ isOpen, minimumLength = 8, onClose, onSubmit }: Props) {
  const [value, setValue] = useState(DEFAULT_VALUE);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  const validation = useFormValidation(() => ({
    password: {
      label: "password",
      value: value.password,
      rules: [required(), minLength(minimumLength, `Password must be at least ${minimumLength} characters`)],
    },
    confirmPassword: {
      label: "confirm password",
      value: value.confirmPassword,
      rules: [
        required(),
        { kind: "format", test: (next) => next === value.password, message: "Password and confirm password must match" },
      ],
    },
  }));

  useEffect(() => {
    if (!isOpen) {
      setValue(DEFAULT_VALUE);
      setSaving(false);
      setServerError("");
      validation.reset();
    }
  }, [isOpen, validation.reset]);

  if (!isOpen) return null;

  const submit = async () => {
    setServerError("");
    if (!validation.attempt()) {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSaving(true);
    try {
      const error = await onSubmit(value);
      if (error) {
        setServerError(error);
      } else {
        setValue(DEFAULT_VALUE);
        validation.reset();
      }
    } finally {
      setSaving(false);
    }
  };

  const currentErrors = [...validation.errors, ...(serverError ? [serverError] : [])];

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={typography.contentTitle}>Change Password</h3>
          <Button variant="plain" icon="close" onClick={onClose} type="button" title="Close" />
        </div>

        <div className={styles.body} ref={bodyRef}>
          <ValidationAlert
            errors={currentErrors}
            visible={validation.showErrors || !!serverError}
            onDismiss={() => {
              validation.dismiss();
              setServerError("");
            }}
          />

          <div className={styles.fieldRow}>
            <label className={styles.fieldGroup}>
              <span className={typography.fieldLabel}>Password</span>
              <Input
                password
                invalid={validation.hasError("password")}
                value={value.password}
                onChange={(e) => setValue((current) => ({ ...current, password: e.target.value }))}
              />
              <span className={typography.fieldHelp}>
                Password must be at least {minimumLength} characters.
              </span>
            </label>
            <label className={styles.fieldGroup}>
              <span className={typography.fieldLabel}>Confirm Password</span>
              <Input
                password
                invalid={validation.hasError("confirmPassword")}
                value={value.confirmPassword}
                onChange={(e) => setValue((current) => ({ ...current, confirmPassword: e.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { void submit(); }} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </div>
  );
}
