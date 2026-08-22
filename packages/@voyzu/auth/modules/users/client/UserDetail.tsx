"use client";

import { DetailBackButton } from "@voyzu/ui-surface/client";
import type { UserAccessMode, UserResponseDto, UserRole, UserStatus, UserUpdateRequestDto } from "@voyzu/auth/types";
import { Badge, Breadcrumbs, Button, Checkbox, ConfirmDialog, Input, maxLength, pattern, required, SearchableSelect, Toast, useFormValidation, ValidationAlert } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { refreshCurrentUserAccess } from "./current-user-access";
import { UserAccessDenied } from "./UserAccessDenied";
import { UserPasswordModal, type UserPasswordValue } from "./UserPasswordModal";
import { getUserStatusColor } from "./user-status-color";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "STANDARD", label: "Standard" },
];

const ACCESS_MODE_OPTIONS = [
  { value: "UI", label: "UI" },
  { value: "API", label: "API" },
  { value: "UI_AND_API", label: "UI and API" },
];

const CODE_PATTERN = /^[A-Z0-9_-]*$/;

interface Props {
  pageTitle: string;
  canManageUsers: boolean;
  user: UserResponseDto | null;
}

export function UserDetail({ pageTitle, canManageUsers, user: initialUser }: Props) {
  const router = useRouter();
  const [user, setUser] = useState(initialUser);
  const [code, setCode] = useState(initialUser?.code ?? "");
  const [email, setEmail] = useState(initialUser?.email ?? "");
  const [displayName, setDisplayName] = useState(initialUser?.displayName ?? "");
  const [role, setRole] = useState<UserRole>(initialUser?.role ?? "STANDARD");
  const [accessMode, setAccessMode] = useState<UserAccessMode>(initialUser?.accessMode ?? "UI");
  const [implementerAccess, setImplementerAccess] = useState(initialUser?.implementerAccess ?? false);
  const [status, setStatus] = useState<UserStatus>(initialUser?.status ?? "ACTIVE");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [serverError, setServerError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const isAdminUser = role === "ADMIN";
  const validation = useFormValidation(() => ({
    code: {
      label: "code",
      value: code,
      rules: [
        required(),
        pattern(CODE_PATTERN, "Code can only contain capital letters, numbers, dashes and underscores"),
        maxLength(20, "Code must be 20 characters or less"),
      ],
    },
    displayName: { label: "display name", value: displayName, rules: [required(), maxLength(50, "Display name must be 50 characters or less")] },
    role: { label: "role", value: role, rules: [required()] },
    accessMode: { label: "access mode", value: accessMode, rules: [required()] },
  }));

  if (!canManageUsers) return <UserAccessDenied pageTitle={pageTitle} />;
  if (!user) return null;

  const save = async () => {
    setServerError("");
    if (!validation.attempt()) return;
    const payload: UserUpdateRequestDto = {
      code,
      email: email || null,
      displayName,
      role,
      accessMode,
      implementerAccess: isAdminUser && implementerAccess,
      status,
    };
    const res = await fetch(`/api/users/${encodeURIComponent(user.code)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { message?: string; error?: string } | null;
      setServerError(body?.message ?? "An unexpected error occurred");
      return;
    }
    const updated = await res.json() as UserResponseDto;
    setUser(updated);
    setCode(updated.code);
    setEmail(updated.email ?? "");
    setDisplayName(updated.displayName);
    setRole(updated.role);
    setAccessMode(updated.accessMode);
    setImplementerAccess(updated.implementerAccess);
    setStatus(updated.status);
    validation.reset();
    refreshCurrentUserAccess();

    setToastMessage(`Updated ${updated.code}`);
    setToastVisible(true);
    if (updated.code !== user.code) router.replace(`/settings/users/${encodeURIComponent(updated.code)}`);
  };

  const transitionStatus = async (action: "activate" | "deactivate") => {
    setServerError("");
    const res = await fetch(`/api/users/${encodeURIComponent(user.code)}/activation`, {
      method: action === "activate" ? "PUT" : "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { message?: string; error?: string } | null;
      setServerError(body?.message ?? "An unexpected error occurred");
      return;
    }
    const updated = await res.json() as UserResponseDto;
    setUser(updated);
    setStatus(updated.status);
    refreshCurrentUserAccess();
    setToastMessage(`${action === "activate" ? "Activated" : "Deactivated"} ${updated.code}`);
    setToastVisible(true);
  };

  const remove = async () => {
    setServerError("");
    const res = await fetch(`/api/users/${encodeURIComponent(user.code)}`, { method: "DELETE" });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { message?: string; error?: string } | null;
      setServerError(body?.message ?? "An unexpected error occurred");
      setIsDeleteOpen(false);
      return;
    }
    router.push(`/settings/users?toast=${encodeURIComponent(`Deleted ${user.code}`)}`);
  };

  const changePassword = async (value: UserPasswordValue): Promise<string | undefined> => {
    setServerError("");
    const res = await fetch(`/api/users/${encodeURIComponent(user.code)}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { message?: string; error?: string } | null;
      return body?.message ?? "An unexpected error occurred";
    }
    setIsPasswordOpen(false);
    setToastMessage(`Changed password for ${user.code}`);
    setToastVisible(true);
    return undefined;
  };

  const currentErrors = [...validation.errors, ...(serverError ? [serverError] : [])];

  return (
    <div className={`${layoutStyles.detailView} ${layoutStyles.detailViewWithStatusRail}`}>
      <header className={layoutStyles.detailHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layoutStyles.slotTitle}>
          <div className={detailStyles.title}>
            <div className={detailStyles.titleIcon}>
              <span className={`material-symbols-outlined ${detailStyles.titleIconSymbol}`}>person</span>
            </div>
            <h1 className={typography.pageTitle}>{displayName || user.code}</h1>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <DetailBackButton fallbackHref={"/settings/users"} />
            <div className={detailStyles.headerActionSeparator} />
            <Button variant="secondary" icon="check_circle" disabled={status === "ACTIVE"} onClick={() => { void transitionStatus("activate"); }}>Activate</Button>
            <Button variant="secondary" icon="block" disabled={status === "INACTIVE"} onClick={() => { void transitionStatus("deactivate"); }}>Deactivate</Button>
            <Button variant="secondary" icon="key" onClick={() => setIsPasswordOpen(true)}>Change Password</Button>
            <div className={detailStyles.headerActionSeparator} />
            <Button variant="secondary-destructive" icon="delete" onClick={() => setIsDeleteOpen(true)} />
          </div>
        </div>
      </header>

      <div className={layoutStyles.slotAlert}>
        <ValidationAlert
          errors={currentErrors}
          visible={validation.showErrors || !!serverError}
          onDismiss={() => {
            validation.dismiss();
            setServerError("");
          }}
        />
      </div>

      <aside className={layoutStyles.statusSection}>
        <div className={detailStyles.card}>
          <div className={detailStyles.fieldGroup}>
            <label className={typography.fieldLabel}>Status</label>
            <Badge variant="soft" size="x-large" color={getUserStatusColor(status)}>{status}</Badge>
          </div>
        </div>
      </aside>

      <main className={layoutStyles.mainSection}>
        <section className={detailStyles.card}>
          <div className={detailStyles.cardHeader}>
            <h2 className={`${typography.sectionHeading} ${detailStyles.cardHeaderTitle}`}>User Details</h2>
            <div className={detailStyles.cardHeaderActions}>
              <Button variant="secondary" icon="save" onClick={save}>Save</Button>
            </div>
          </div>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Code</span>
              <Input
                invalid={validation.hasError("code")}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={20}
              />
              <span className={typography.fieldHelp}>Capital letters, numbers, dash and underscore only.</span>
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Display Name</span>
              <Input
                invalid={validation.hasError("displayName")}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Email (optional)</span>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Role</span>
              <SearchableSelect
                value={role}
                onChange={(next) => {
                  const nextRole = next as UserRole;
                  setRole(nextRole);
                  if (nextRole !== "ADMIN") setImplementerAccess(false);
                }}
                options={ROLE_OPTIONS}
                searchable={false}
                codeBadge={false}
                hasError={validation.hasError("role")}
              />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Access Mode</span>
              <SearchableSelect value={accessMode} onChange={(next) => setAccessMode(next as UserAccessMode)} options={ACCESS_MODE_OPTIONS} searchable={false} codeBadge={false} hasError={validation.hasError("accessMode")} />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Implementer Access</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minHeight: "2.75rem" }}>
                <Checkbox
                  checked={isAdminUser && implementerAccess}
                  disabled={!isAdminUser}
                  onChange={() => setImplementerAccess((current) => !current)}
                />
                <span className={typography.bodyText}>{isAdminUser ? "Show implementer tools." : "Admin users only."}</span>
              </div>
            </label>
          </div>
        </section>

      </main>

      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete User"
        message={`Are you sure you want to delete ${user.code}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={remove}
      />
      <UserPasswordModal
        isOpen={isPasswordOpen}
        minimumLength={user.accessMode === "API" || user.accessMode === "UI_AND_API" ? 16 : 8}
        onClose={() => setIsPasswordOpen(false)}
        onSubmit={changePassword}
      />
      <Toast isVisible={toastVisible} onClose={() => setToastVisible(false)} message={toastMessage} />
    </div>
  );
}
