"use client";

import { useEffect, useState } from "react";
import type { OrganizationAccess } from "@voyzu/types/business-objects/organization-access";
import type { UserResponseDto } from "@voyzu/auth/types";
import type { UserOrganizationAccessResponseDto } from "../../../types/user-organization-access.dto";
import { Badge, Button, Checkbox, Toast, ValidationAlert } from "@voyzu/ui-components";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import styles from "./user-organization-access.module.css";

export function UserOrganizationAccessTab({ user }: { user: UserResponseDto }) {
  const [data, setData] = useState<UserOrganizationAccessResponseDto | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const isAdmin = user.role === "ADMIN";
  const url = `/api/users/${encodeURIComponent(user.code)}/organization-access`;

  useEffect(() => {
    if (isAdmin) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load organization access.");
        const result = await response.json() as UserOrganizationAccessResponseDto;
        setData(result);
        setSelectedIds(result.access.organization_ids);
      } catch (error) {
        if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load organization access.");
      }
    }
    void load();
    return () => controller.abort();
  }, [url, isAdmin]);

  async function save() {
    setSaving(true);
    setError("");
    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organization_ids: selectedIds }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        throw new Error(body?.message ?? "Unable to save organization access.");
      }
      const access = await response.json() as OrganizationAccess;
      setSelectedIds(access.organization_ids);
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to save organization access.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={detailStyles.card}>
      <div className={detailStyles.cardHeader}>
        <h2 className={`${typography.sectionHeading} ${detailStyles.cardHeaderTitle}`}>Organization Access</h2>
        {!isAdmin && <Button variant="secondary" icon="save" disabled={!data || saving} onClick={() => void save()}>{saving ? "Saving..." : "Save"}</Button>}
      </div>
      <ValidationAlert errors={error ? [error] : []} visible={!!error} onDismiss={() => setError("")} />
      {isAdmin ? <p>Admin users have access to all organizations.</p> : !data ? (
        !error && <p>Loading organization access...</p>
      ) : (
        <div className={styles.organizationList}>
          <p>Select the organizations this user can access.</p>
          {data.organizations.length === 0 && <p>No organizations have been created yet.</p>}
          {data.organizations.map((organization) => (
            <label key={organization.id} className={styles.organizationOption}>
              <Checkbox checked={selectedIds.includes(organization.id)} disabled={saving} onChange={() => setSelectedIds((current) => current.includes(organization.id) ? current.filter((id) => id !== organization.id) : [...current, organization.id])} />
              <span>{organization.code} — {organization.name}</span>
              {organization.status !== "ACTIVE" && <Badge variant="soft" size="x-small" color="neutral">INACTIVE</Badge>}
            </label>
          ))}
        </div>
      )}
      <Toast isVisible={saved} message="Updated organization access" onClose={() => setSaved(false)} />
    </section>
  );
}
