"use client";

import { useState } from "react";
import type { UserProfileUpdateRequestDto, UserResponseDto } from "@voyzu/auth/types";
import { Badge } from "@voyzu/ui-components";
import { Breadcrumbs } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import { Toast } from "@voyzu/ui-components";
import { ValidationAlert } from "@voyzu/ui-components";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import { refreshCurrentUserAccess } from "./current-user-access";
import { UserPasswordModal, type UserPasswordValue } from "./UserPasswordModal";
import { getUserStatusColor } from "./user-status-color";

interface UserProfileProps {
  user: UserResponseDto;
}

function parseError(body: unknown): string {
  if (body && typeof body === "object") {
    const value = body as { message?: string; error?: string };
    return value.message ?? value.error ?? "An unexpected error occurred";
  }
  return "An unexpected error occurred";
}

export function UserProfile({ user: initialUser }: UserProfileProps) {
  const [user, setUser] = useState(initialUser);
  const [displayName, setDisplayName] = useState(initialUser.displayName);
  const [email, setEmail] = useState(initialUser.email ?? "");
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const save = async () => {
    setError("");
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    const payload: UserProfileUpdateRequestDto = {
      displayName: displayName.trim(),
      email: email.trim() || null,
    };
    const response = await fetch("/api/users/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setError(parseError(await response.json().catch(() => null)));
      return;
    }
    const updated = (await response.json()) as UserResponseDto;
    setUser(updated);
    setDisplayName(updated.displayName);
    setEmail(updated.email ?? "");
    refreshCurrentUserAccess();
    setToastMessage("Updated profile");
    setToastVisible(true);
  };

  const changePassword = async (value: UserPasswordValue): Promise<string | undefined> => {
    setError("");
    const response = await fetch("/api/users/me/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(value),
    });
    if (!response.ok) {
      return parseError(await response.json().catch(() => null));
    }
    setIsPasswordOpen(false);
    setToastMessage("Changed password");
    setToastVisible(true);
    return undefined;
  };

  return (
    <div className={`${layoutStyles.detailView} ${layoutStyles.detailViewWithStatusRail}`}>
      <header className={layoutStyles.detailHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layoutStyles.slotTitle}>
          <div className={detailStyles.title}>
            <div className={detailStyles.titleIcon}>
              <span className={`material-symbols-outlined ${detailStyles.titleIconSymbol}`}>account_circle</span>
            </div>
            <h1 className={typography.pageTitle}>User Profile</h1>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <Button variant="secondary" icon="key" onClick={() => setIsPasswordOpen(true)}>
              Change Password
            </Button>
          </div>
        </div>
      </header>

      <div className={layoutStyles.slotAlert}>
        <ValidationAlert
          errors={error ? [error] : []}
          visible={!!error}
          onDismiss={() => setError("")}
        />
      </div>

      <main className={layoutStyles.mainSection}>
        <section className={detailStyles.card}>
          <div className={detailStyles.cardHeader}>
            <h2 className={`${typography.sectionHeading} ${detailStyles.cardHeaderTitle}`}>Profile</h2>
            <div className={detailStyles.cardHeaderActions}>
              <Button variant="secondary" icon="save" onClick={save}>
                Save
              </Button>
            </div>
          </div>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Code</span>
              <Input value={user.code} disabled />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Display Name</span>
              <Input
                value={displayName}
                maxLength={50}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Email</span>
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <div className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Role</span>
              <Badge variant="soft" size="x-large" color="neutral">
                {user.role}
              </Badge>
            </div>
          </div>
        </section>
      </main>

      <aside className={layoutStyles.statusSection}>
        <div className={detailStyles.card}>
          <div className={detailStyles.fieldGroup}>
            <span className={typography.fieldLabel}>Status</span>
            <Badge variant="soft" size="x-large" color={getUserStatusColor(user.status)}>
              {user.status}
            </Badge>
          </div>
        </div>
      </aside>

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
