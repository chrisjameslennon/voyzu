"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { UserAccessMode, UserRole, UserStatus } from "@voyzu/auth/types";
import styles from "@voyzu/ui-style/css-modules/modal.module.css";
import { Button } from "@voyzu/ui-components";
import { Checkbox } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import { SearchableSelect } from "@voyzu/ui-components";
import { ValidationAlert } from "@voyzu/ui-components";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import { maxLength, minLength, pattern, required, useFormValidation } from "@voyzu/ui-components";

export interface UserCompanyOption {
  id: number;
  code: string;
  name: string;
}

export interface UserFormValue {
  code: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  accessMode: UserAccessMode;
  showDeveloperLinks: boolean;
  status: UserStatus;
  companyIds: number[];
}

interface Props {
  isOpen: boolean;
  title: string;
  companies: UserCompanyOption[];
  initial?: UserFormValue;
  onClose: () => void;
  onSubmit: (value: UserFormValue) => Promise<string | undefined>;
}

const DEFAULT_VALUE: UserFormValue = {
  code: "",
  email: "",
  displayName: "",
  password: "",
  confirmPassword: "",
  role: "COMPANY_USER",
  accessMode: "UI",
  showDeveloperLinks: false,
  status: "ACTIVE",
  companyIds: [],
};

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "ORGANIZATION_USER", label: "Organization user" },
  { value: "COMPANY_USER", label: "Company user" },
];

const ACCESS_MODE_OPTIONS = [
  { value: "UI", label: "UI" },
  { value: "API", label: "API" },
  { value: "UI_AND_API", label: "UI and API" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const CODE_PATTERN = /^[A-Z0-9_-]*$/;

export function UserFormModal({ isOpen, title, companies, initial, onClose, onSubmit }: Props) {
  const [value, setValue] = useState<UserFormValue>(initial ?? DEFAULT_VALUE);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const isCompanyUser = value.role === "COMPANY_USER";
  const isAdminUser = value.role === "ADMIN";
  const minimumPasswordLength = value.accessMode === "API" || value.accessMode === "UI_AND_API" ? 16 : 8;
  const visibleCompanyIds = useMemo(
    () => isCompanyUser ? new Set(value.companyIds) : new Set(companies.map((company) => company.id)),
    [companies, isCompanyUser, value.companyIds],
  );

  const validation = useFormValidation(() => ({
    code: {
      label: "code",
      value: value.code,
      rules: [
        required(),
        pattern(CODE_PATTERN, "Code can only contain capital letters, numbers, dashes and underscores"),
        maxLength(20, "Code must be 20 characters or less"),
      ],
    },
    displayName: { label: "display name", value: value.displayName, rules: [required(), maxLength(50, "Display name must be 50 characters or less")] },
    password: {
      label: "password",
      value: value.password,
      rules: [required(), minLength(minimumPasswordLength, `Password must be at least ${minimumPasswordLength} characters`)],
    },
    confirmPassword: {
      label: "confirm password",
      value: value.confirmPassword,
      rules: [
        required(),
        { kind: "format", test: (next) => next === value.password, message: "Password and confirm password must match" },
      ],
    },
    role: { label: "role", value: value.role, rules: [required()] },
    accessMode: { label: "access mode", value: value.accessMode, rules: [required()] },
    status: { label: "status", value: value.status, rules: [required()] },
  }));

  useEffect(() => {
    if (!isOpen) {
      setValue(initial ?? DEFAULT_VALUE);
      setSaving(false);
      setServerError("");
      validation.reset();
    }
  }, [initial, isOpen, validation.reset]);

  if (!isOpen) return null;

  const setField = <K extends keyof UserFormValue>(key: K, next: UserFormValue[K]) => {
    setValue((current) => ({
      ...current,
      [key]: next,
      ...(key === "role" && next !== "COMPANY_USER" ? { companyIds: [] } : {}),
      ...(key === "role" && next !== "ADMIN" ? { showDeveloperLinks: false } : {}),
    }));
  };

  const toggleCompany = (companyId: number) => {
    if (!isCompanyUser) return;
    setValue((current) => {
      const next = new Set(current.companyIds);
      if (next.has(companyId)) next.delete(companyId);
      else next.add(companyId);
      return { ...current, companyIds: [...next] };
    });
  };

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
        setValue(initial ?? DEFAULT_VALUE);
        validation.reset();
      }
    } finally {
      setSaving(false);
    }
  };

  const currentErrors = [...validation.errors, ...(serverError ? [serverError] : [])];

  return (
    <div className={styles.backdrop}>
      <form
        className={styles.modal}
        autoComplete="off"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className={styles.header}>
          <h3 className={typography.contentTitle}>{title}</h3>
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
              name="code"
              autoComplete="off"
              invalid={validation.hasError("code")}
              value={value.code}
              onChange={(e) => setField("code", e.target.value.toUpperCase())}
              maxLength={20}
            />
            <span className={typography.fieldHelp}>Capital letters, numbers, dash and underscore only.</span>
          </label>
          <label className={styles.fieldGroup}>
            <span className={typography.fieldLabel}>Display name</span>
            <Input
              name="displayName"
              autoComplete="off"
              invalid={validation.hasError("displayName")}
              value={value.displayName}
              onChange={(e) => setField("displayName", e.target.value)}
              maxLength={50}
            />
          </label>
          <label className={styles.fieldGroup}>
            <span className={typography.fieldLabel}>Email (optional)</span>
            <Input
              name="email"
              type="email"
              autoComplete="off"
              value={value.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </label>
          <label className={styles.fieldGroup}>
            <span className={typography.fieldLabel}>Role</span>
            <SearchableSelect value={value.role} onChange={(next) => setField("role", next as UserRole)} options={ROLE_OPTIONS} searchable={false} codeBadge={false} hasError={validation.hasError("role")} />
          </label>
          <label className={styles.fieldGroup}>
            <span className={typography.fieldLabel}>Access mode</span>
            <SearchableSelect value={value.accessMode} onChange={(next) => setField("accessMode", next as UserAccessMode)} options={ACCESS_MODE_OPTIONS} searchable={false} codeBadge={false} hasError={validation.hasError("accessMode")} />
          </label>
          <label className={styles.fieldGroup}>
            <span className={typography.fieldLabel}>Show Developer Links</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: "2.75rem" }}>
              <Checkbox
                checked={isAdminUser && value.showDeveloperLinks}
                disabled={!isAdminUser}
                onChange={() => setField("showDeveloperLinks", !value.showDeveloperLinks)}
              />
              <span className={typography.bodyText}>{isAdminUser ? "Show developer toolbar links." : "Admin users only."}</span>
            </div>
          </label>
          <label className={styles.fieldGroup}>
            <span className={typography.fieldLabel}>Status</span>
            <SearchableSelect value={value.status} onChange={(next) => setField("status", next as UserStatus)} options={STATUS_OPTIONS} searchable={false} codeBadge={false} hasError={validation.hasError("status")} />
          </label>
        </div>

        <div className={styles.section}>
          <h4 className={`${typography.sectionHeading} ${styles.compactSectionHeading}`}>Set Password</h4>
          <div className={styles.fieldRow}>
            <label className={styles.fieldGroup}>
              <span className={typography.fieldLabel}>Password</span>
              <Input
                name="password"
                password
                autoComplete="new-password"
                invalid={validation.hasError("password")}
                value={value.password}
                onChange={(e) => setField("password", e.target.value)}
              />
              <span className={typography.fieldHelp}>
                {value.accessMode === "API" || value.accessMode === "UI_AND_API"
                  ? "API users require a password of at least 16 characters."
                  : "UI users require a password of at least 8 characters."}
              </span>
            </label>
            <label className={styles.fieldGroup}>
              <span className={typography.fieldLabel}>Confirm Password</span>
              <Input
                name="confirmPassword"
                password
                autoComplete="new-password"
                invalid={validation.hasError("confirmPassword")}
                value={value.confirmPassword}
                onChange={(e) => setField("confirmPassword", e.target.value)}
              />
            </label>
          </div>
        </div>

        <div className={styles.section}>
          <h4 className={`${typography.sectionHeading} ${styles.compactSectionHeading}`}>Company access</h4>
          <p className={typography.bodyText}>
            {isCompanyUser
              ? companies.length === 0
                ? "This organization has no companies yet."
                : "Select the companies this user can access."
              : "This role has access to all companies."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", columnGap: "2rem", rowGap: "0.625rem", marginTop: "0.75rem" }}>
            {companies.map((company) => (
              <label key={company.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
                <Checkbox checked={visibleCompanyIds.has(company.id)} disabled={!isCompanyUser} onChange={() => toggleCompany(company.id)} />
                <span className={typography.bodyText}>{company.code} - {company.name}</span>
              </label>
            ))}
          </div>
        </div>
        </div>

        <div className={styles.footer}>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </div>
  );
}
