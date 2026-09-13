"use client";

import { useMemo, useState } from "react";

import type {
  OrganizationAccessPage as OrganizationAccessPageData,
  OrganizationAccessUser,
} from "@voyzu/organization/types/modules/organization-access";
import layout from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import modalStyles from "@voyzu/ui-style/css-modules/modal.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import {
  Badge,
  Breadcrumbs,
  Button,
  Checkbox,
  DataTable,
  type DataTableColumn,
  Toast,
  ValidationAlert,
} from "@voyzu/ui-components";
import styles from "./organization-access.module.css";

type OrganizationAccessRow = OrganizationAccessUser & { id: number };

export function OrganizationAccess({ initial }: { initial: OrganizationAccessPageData }) {
  const [users, setUsers] = useState(initial.users);
  const [editing, setEditing] = useState<OrganizationAccessUser | null>(null);
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const rows = useMemo<OrganizationAccessRow[]>(
    () => users.map((user) => ({ ...user, id: user.userId })),
    [users],
  );

  const columns: DataTableColumn<OrganizationAccessRow>[] = [
    { key: "userCode", label: "User", render: (row) => <span className={listStyles.codeCell}>{row.userCode}</span> },
    { key: "displayName", label: "Name" },
    { key: "userRole", label: "Role", render: (row) => row.userRole === "ADMIN" ? "Admin" : "Standard" },
    {
      key: "organizationIds",
      label: "Organization access",
      render: (row) => row.userRole === "ADMIN"
        ? "All organizations"
        : row.organizationIds.length === 0
        ? "No organizations"
        : `${row.organizationIds.length} ${row.organizationIds.length === 1 ? "organization" : "organizations"}`,
    },
    {
      key: "userStatus",
      label: "Status",
      align: "center",
      render: (row) => (
        <Badge variant="soft" size="x-small" color={row.userStatus === "ACTIVE" ? "success" : "neutral"}>
          {row.userStatus}
        </Badge>
      ),
    },
  ];

  const openEditor = (user: OrganizationAccessUser) => {
    setEditing(user);
    setSelectedOrganizationIds(new Set(user.organizationIds));
    setError("");
  };

  const toggleOrganization = (organizationId: number) => {
    setSelectedOrganizationIds((current) => {
      const next = new Set(current);
      if (next.has(organizationId)) next.delete(organizationId);
      else next.add(organizationId);
      return next;
    });
  };

  const save = async () => {
    if (!editing || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/organization/organization-access/${encodeURIComponent(editing.userCode)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationIds: [...selectedOrganizationIds] }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setError(body?.message ?? "Unable to update organization access");
        return;
      }
      const updated = await response.json() as OrganizationAccessUser;
      setUsers((current) => current.map((user) => user.userId === updated.userId ? updated : user));
      setEditing(null);
      setToastVisible(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${layout.listView} vz-grid-12`}>
      <header className={layout.listHeader}>
        <div className={layout.slotBreadcrumb}><Breadcrumbs /></div>
        <div className={layout.slotTitle}>
          <div className={listStyles.titleIcon}>
            <span className={`material-symbols-outlined ${listStyles.titleIconSymbol}`}>manage_accounts</span>
          </div>
          <h1 className={`${typography.pageTitle} ${layout.pageTitleResponsive}`}>Organization Access</h1>
          <div className={layout.slotTitleByline}>
            <p className={typography.headingByline}>Assign standard users to the organizations they can access.</p>
          </div>
        </div>
      </header>

      <div className={layout.listBody}>
        <div className={layout.slotBody}>
          <DataTable
            columns={columns}
            rows={rows}
            selectedIds={new Set<number>()}
            isAllSelected={false}
            isSomeSelected={false}
            onSelectAll={() => undefined}
            onSelectOne={() => undefined}
            onRowClick={openEditor}
            noSelectionColumn
            currentPage={1}
            totalPages={1}
            onPageChange={() => undefined}
            totalCount={rows.length}
            filteredCount={rows.length}
            itemLabel="users"
            hasData={rows.length > 0}
            emptyIcon="manage_accounts"
            emptyTitle="No users"
            emptyText="Create a user to manage organization access."
          />
        </div>
      </div>

      {editing ? (
        <div className={modalStyles.backdrop}>
          <div className={modalStyles.modal} role="dialog" aria-modal="true" aria-label={`Organization access for ${editing.userCode}`}>
            <div className={modalStyles.header}>
              <div className={styles.modalHeaderContent}>
                <h2 className={`${typography.contentTitle} ${styles.modalTitle}`}>Organization Access</h2>
                <div className={styles.userIdentity}>
                  <Badge variant="soft" size="small" color="neutral">{editing.userCode}</Badge>
                  <span className={typography.bodyText}>{editing.displayName}</span>
                </div>
              </div>
              <Button variant="plain" icon="close" title="Close" onClick={() => setEditing(null)} />
            </div>
            <div className={modalStyles.body}>
              <ValidationAlert errors={error ? [error] : []} visible={Boolean(error)} onDismiss={() => setError("")} />
              {editing.userRole === "ADMIN" ? (
                <p className={`${typography.bodyText} ${styles.adminMessage}`}>
                  Admin users have access to all organizations
                </p>
              ) : (
                <div className={styles.organizationList}>
                  {initial.organizations.map((organization) => (
                    <label key={organization.id} className={styles.organizationOption}>
                      <Checkbox
                        checked={selectedOrganizationIds.has(organization.id)}
                        onChange={() => toggleOrganization(organization.id)}
                      />
                      <span className={typography.bodyText}>{organization.code} — {organization.name}</span>
                      {organization.status !== "ACTIVE" ? <Badge variant="soft" size="x-small" color="neutral">INACTIVE</Badge> : null}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className={modalStyles.footer}>
              {editing.userRole === "ADMIN" ? (
                <Button variant="cancel" onClick={() => setEditing(null)}>Close</Button>
              ) : (
                <>
                  <Button variant="cancel" onClick={() => setEditing(null)}>Cancel</Button>
                  <Button variant="primary" disabled={saving} onClick={() => { void save(); }}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}

      <Toast
        isVisible={toastVisible}
        message="Updated organization access"
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}
