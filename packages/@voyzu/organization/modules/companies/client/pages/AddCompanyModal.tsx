"use client";

import { useEffect, useRef, useState } from "react";

import type { CompanyCreateRequestDto } from "@voyzu/organization/types/modules/companies";
import { Button, Input, SearchableSelect, ValidationAlert } from "@voyzu/ui-components";
import { maxLength, pattern, required, useFormValidation } from "@voyzu/ui-components";
import styles from "@voyzu/ui-style/css-modules/modal.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

type SelectOption = { value: string; label: string; code?: string };

interface AddCompanyModalProps {
  isOpen: boolean;
  activeCountries: SelectOption[];
  countryDefaultCurrencies: Record<string, string>;
  onClose: () => void;
  onCreate: (data: CompanyCreateRequestDto) => Promise<string | undefined>;
}

const CODE_PATTERN = /^[A-Z0-9_-]*$/;

export function AddCompanyModal({
  isOpen,
  activeCountries,
  countryDefaultCurrencies,
  onClose,
  onCreate,
}: AddCompanyModalProps) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const validation = useFormValidation(() => ({
    code: {
      label: "code",
      value: code,
      rules: [
        required(),
        pattern(CODE_PATTERN, "Code can only contain capital letters, numbers, dashes and underscores"),
        maxLength(14, "Code must be 14 characters or less"),
      ],
    },
    name: { label: "name", value: name, rules: [required()] },
    country: { label: "country", value: countryCode, rules: [required()] },
  }));

  useEffect(() => {
    if (!isOpen) {
      setCode("");
      setName("");
      setCountryCode("");
      setServerError("");
      setSaving(false);
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
      const error = await onCreate({
        code,
        name,
        countryCode,
        baseCurrencyCode: countryDefaultCurrencies[countryCode],
      });
      if (error) {
        setServerError(error);
      } else {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const currentErrors = [...validation.errors, ...(serverError ? [serverError] : [])];

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={typography.contentTitle}>Add a new company</h3>
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
              <span className={typography.fieldLabel}>Code</span>
              <Input
                invalid={validation.hasError("code")}
                placeholder="e.g. ACME"
                maxLength={14}
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
              <span className={typography.fieldHelp}>Capital letters, numbers, dash and underscore only. 14 characters max.</span>
            </label>
            <label className={styles.fieldGroup}>
              <span className={typography.fieldLabel}>Name</span>
              <Input
                invalid={validation.hasError("name")}
                placeholder="e.g. Acme Ltd"
                maxLength={50}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.fieldGroup}>
              <span className={typography.fieldLabel}>Country</span>
              <SearchableSelect
                value={countryCode}
                onChange={setCountryCode}
                options={activeCountries}
                placeholder="Select a country"
                searchPlaceholder="Search countries..."
                hasError={validation.hasError("country")}
              />
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { void submit(); }} disabled={saving}>
            {saving ? "Creating..." : "Create Company"}
          </Button>
        </div>
      </div>
    </div>
  );
}
