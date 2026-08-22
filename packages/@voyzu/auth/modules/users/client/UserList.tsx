"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserCreateRequestDto } from "@voyzu/auth/types";
import type { UserResponseDto } from "@voyzu/auth/types";
import { Badge } from "@voyzu/ui-components";
import { Breadcrumbs } from "@voyzu/ui-components";
import { Button } from "@voyzu/ui-components";
import { ConfirmDialog } from "@voyzu/ui-components";
import { DataTable, type DataTableColumn } from "@voyzu/ui-components";
import { DropdownMenu, type DropdownMenuItem } from "@voyzu/ui-components";
import { FilterChips, FilterPanel, type FilterState, type FilterTab } from "@voyzu/ui-components";
import { Input } from "@voyzu/ui-components";
import { Toast } from "@voyzu/ui-components";
import { ValidationAlert } from "@voyzu/ui-components";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import layout from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import styles from "@voyzu/ui-style/css-modules/list.module.css";
import { UserAccessDenied } from "./UserAccessDenied";
import { refreshCurrentUserAccess } from "./current-user-access";
import { UserFormModal, type UserFormValue } from "./UserFormModal";
import { getUserStatusColor } from "./user-status-color";

interface Props {
  pageTitle: string;
  canManageUsers: boolean;
  initialUsers: UserResponseDto[];
}

const ITEMS_PER_PAGE = 100;

export function UserList({ pageTitle, canManageUsers, initialUsers }: Props) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [serverError, setServerError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const columns: DataTableColumn<UserResponseDto>[] = [
    { key: "code", label: "Code", render: (row) => <span className={styles.codeCell}>{row.code}</span> },
    { key: "displayName", label: "Name" },
    { key: "email", label: "Email", render: (row) => row.email ?? "-" },
    { key: "role", label: "Role" },
    { key: "accessMode", label: "Access Mode" },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (row) => (
        <Badge variant="soft" size="x-small" color={getUserStatusColor(row.status)}>
          {row.status}
        </Badge>
      ),
    },
  ];

  const filterTabs: FilterTab[] = useMemo(() => [
    { key: "role", label: "Role", type: "checkbox", options: [...new Set(users.map((user) => user.role))].sort() },
    { key: "accessMode", label: "Access Mode", type: "checkbox", options: [...new Set(users.map((user) => user.accessMode))].sort() },
    { key: "status", label: "Status", type: "checkbox", options: [...new Set(users.map((user) => user.status))].sort() },
  ], [users]);

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
  };

  const handleRemoveFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const filtered = useMemo(() => {
    let result = users;
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((user) =>
        user.code.toLowerCase().includes(q) ||
        user.displayName.toLowerCase().includes(q) ||
        (user.email ?? "").toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q),
      );
    }

    const roles = activeFilters.role as string[] | undefined;
    if (roles?.length) result = result.filter((user) => roles.includes(user.role));

    const accessModes = activeFilters.accessMode as string[] | undefined;
    if (accessModes?.length) result = result.filter((user) => accessModes.includes(user.accessMode));

    const statuses = activeFilters.status as string[] | undefined;
    if (statuses?.length) result = result.filter((user) => statuses.includes(user.status));

    return result;
  }, [activeFilters, search, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const isAllSelected = paginated.length > 0 && paginated.every((user) => selectedIds.has(user.id));
  const isSomeSelected = paginated.some((user) => selectedIds.has(user.id)) && !isAllSelected;
  const selectedUsers = users.filter((user) => selectedIds.has(user.id));
  const hasSelection = selectedUsers.length > 0;
  const canActivateSelection = hasSelection && selectedUsers.some((user) => user.status === "INACTIVE");
  const canDeactivateSelection = hasSelection && selectedUsers.some((user) => user.status === "ACTIVE");
  const hasActiveFilters = Object.keys(activeFilters).some((key) => (activeFilters[key] as string[] | undefined)?.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtered.length]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get("toast");
    if (msg) {
      setToastMessage(msg);
      setToastVisible(true);
      window.history.replaceState({}, "", "/settings/users");
    }
  }, []);

  const createUser = async (value: UserFormValue): Promise<string | undefined> => {
    setServerError("");
    const payload: UserCreateRequestDto = {
      code: value.code,
      email: value.email || null,
      displayName: value.displayName,
      password: value.password,
      confirmPassword: value.confirmPassword,
      role: value.role,
      accessMode: value.accessMode,
      implementerAccess: value.role === "ADMIN" && value.implementerAccess,
      status: value.status,
    };
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null) as { message?: string; error?: string } | null;
      return body?.message ?? "An unexpected error occurred";
    }
    const created = await res.json() as UserResponseDto;
    setUsers((current) => [...current.filter((user) => user.id !== created.id), created].sort((a, b) => a.code.localeCompare(b.code)));
    setIsCreateOpen(false);
    setToastMessage(`Created ${created.code}`);
    setToastVisible(true);
    return undefined;
  };

  const handleExport = async (rows: UserResponseDto[], filename: string) => {
    const exportColumns = [
      { key: "code", label: "Code" },
      { key: "displayName", label: "Name" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "accessMode", label: "Access Mode" },
      { key: "status", label: "Status" },
    ];

    const res = await fetch("/api/capability/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, columns: exportColumns, rows }),
    });
    if (!res.ok) return;

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportItems = useMemo<DropdownMenuItem[]>(() => [
    {
      value: "selected",
      label: `Selected (${selectedIds.size})`,
      icon: "check_box",
      disabled: !hasSelection,
      onSelect: () => { void handleExport(selectedUsers, "users_selected"); },
    },
    {
      value: "current-view",
      label: `Current view (${filtered.length})`,
      icon: "visibility",
      onSelect: () => { void handleExport(filtered, "users_current_view"); },
    },
    {
      value: "full-dataset",
      label: `Full dataset (${users.length})`,
      icon: "database",
      onSelect: () => { void handleExport(users, "users_full_dataset"); },
    },
  ], [filtered, hasSelection, selectedIds.size, selectedUsers, users]);

  if (!canManageUsers) return <UserAccessDenied pageTitle={pageTitle} />;

  const refresh = async () => {
    if (refreshing) return;
    setServerError("");
    setRefreshing(true);
    try {
      const res = await fetch("/api/users");
      if (!res.ok) {
        setServerError(await readServerError(res));
        return;
      }
      setUsers(await res.json() as UserResponseDto[]);
      setSelectedIds(new Set());
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const transitionSelected = async (action: "activate" | "deactivate") => {
    setServerError("");
    const codes = selectedUsers.map((user) => user.code);
    const res = await fetch("/api/user-batches/activation", {
      method: action === "activate" ? "PUT" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes }),
    });
    if (!res.ok) {
      setServerError(await readServerError(res));
      return;
    }
    const updated = await res.json() as UserResponseDto[];
    const updatedById = new Map(updated.map((user) => [user.id, user]));
    setUsers((current) => current.map((user) => updatedById.get(user.id) ?? user));
    setSelectedIds(new Set());
    refreshCurrentUserAccess();
    setToastMessage(`${action === "activate" ? "Activated" : "Deactivated"} ${updated.length} ${updated.length === 1 ? "user" : "users"}`);
    setToastVisible(true);
  };

  const deleteUsers = async () => {
    setIsDeleteOpen(false);
    setServerError("");
    const codes = selectedUsers.map((user) => user.code);
    const res = await fetch("/api/user-batches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codes }),
    });
    if (!res.ok) {
      setServerError(await readServerError(res));
      return;
    }
    setUsers((current) => current.filter((user) => !selectedIds.has(user.id)));
    setSelectedIds(new Set());
    setToastMessage(`Deleted ${codes.length} ${codes.length === 1 ? "user" : "users"}`);
    setToastVisible(true);
  };

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) paginated.forEach((user) => next.delete(user.id));
    else paginated.forEach((user) => next.add(user.id));
    setSelectedIds(next);
  };

  const toggleSelectOne = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className={`${layout.listView} vz-grid-12`}>
      <header className={layout.listHeader}>
        <div className={layout.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layout.slotTitle}>
          <div className={styles.titleIcon}>
            <span className={`material-symbols-outlined ${styles.titleIconSymbol}`}>person</span>
          </div>
          <h1 className={`${typography.pageTitle} ${layout.pageTitleResponsive}`}>{pageTitle}</h1>
          <div className={layout.slotTitleByline}>
            <p className={typography.headingByline}>Manage application users, roles, and access modes.</p>
          </div>
        </div>
        <div className={layout.slotActions}>
          <Button
            variant="primary"
            icon="add"
            className={layout.slotPrimaryAction}
            onClick={() => setIsCreateOpen(true)}
          >
            Add User
          </Button>
        </div>
      </header>

      <div className={layout.listToolbar}>
        <div className={layout.slotToolbarLeft}>
          <FilterPanel
            tabs={filterTabs}
            filters={activeFilters}
            onApply={handleApplyFilters}
            onClear={() => setActiveFilters({})}
            onRemoveFilter={handleRemoveFilter}
            showChips={false}
          />
        </div>

        <div className={layout.slotToolbarSearch}>
          <Input
            search
            containerClassName={layout.slotSearchControl}
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search users..."
          />
        </div>

        <div className={layout.slotToolbarRight}>
          <div className={styles.toolbarActions}>
            <Button variant="secondary" icon="check_circle" disabled={!canActivateSelection} title="Activate selected" onClick={() => { void transitionSelected("activate"); }}>
              Activate
            </Button>
            <Button variant="secondary" icon="block" disabled={!canDeactivateSelection} title="Deactivate selected" onClick={() => { void transitionSelected("deactivate"); }}>
              Deactivate
            </Button>
            <Button variant="secondary-destructive" icon="delete" disabled={!hasSelection} title="Delete selected" onClick={() => setIsDeleteOpen(true)} />
            <div className={styles.divider} />
            <Button
              variant="plain"
              icon="sync"
              className={refreshing ? styles.spinning : undefined}
              disabled={refreshing}
              title="Refresh"
              onClick={() => { void refresh(); }}
            />
            <DropdownMenu
              trigger={<Button variant="plain" icon="file_download" title="Export" />}
              items={exportItems}
              alignment="right"
              width={260}
            />
          </div>
        </div>
      </div>

      {(hasActiveFilters || search.trim()) && (
        <div className={layout.chipsRow}>
          <div className={layout.slotChips}>
            <FilterChips
              tabs={filterTabs}
              filters={activeFilters}
              additionalChips={search.trim()
                ? [{
                    key: "search",
                    label: "Search contains",
                    value: search.trim(),
                    onRemove: () => {
                      setSearch("");
                      setCurrentPage(1);
                    },
                  }]
                : []}
              onRemoveFilter={handleRemoveFilter}
              onClear={() => {
                setActiveFilters({});
                setSearch("");
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}

      {serverError && (
        <div className={layout.slotAlert}>
          <ValidationAlert
            errors={[serverError]}
            visible
            onDismiss={() => setServerError("")}
          />
        </div>
      )}

      <div className={layout.listBody}>
        <div className={layout.slotBody}>
          <DataTable
            columns={columns}
            rows={paginated}
            selectedIds={selectedIds}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onSelectAll={toggleSelectAll}
            onSelectOne={toggleSelectOne}
            onRowClick={(user) => router.push(`/settings/users/${encodeURIComponent(user.code)}`)}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalCount={users.length}
            filteredCount={filtered.length}
            itemLabel="users"
            hasData={users.length > 0}
            emptyIcon="person"
            emptyTitle="No users"
            emptyText="Create a user to get started"
            emptyFilterText="Try adjusting your search"
            mobileRender={(user) => (
              <div className={styles.mobileCard}>
                <div className={styles.mobileCode}>{user.code}</div>
                <div className={styles.mobileName}>
                  <span className={styles.mobileNameText}>{user.displayName}</span>
                </div>
                <div className={styles.mobileMeta}>
                  {user.email ?? "-"}
                </div>
                <div className={styles.mobileMeta}>
                  <Badge variant="soft" size="x-small" color={getUserStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </div>
              </div>
            )}
          />
        </div>
      </div>

      <UserFormModal
        isOpen={isCreateOpen}
        title="Add User"
        onClose={() => setIsCreateOpen(false)}
        onSubmit={createUser}
      />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Users"
        message={`Are you sure you want to delete ${selectedUsers.length} ${selectedUsers.length === 1 ? "user" : "users"}?`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={deleteUsers}
      />
      <Toast isVisible={toastVisible} onClose={() => setToastVisible(false)} message={toastMessage} />
    </div>
  );
}

async function readServerError(res: Response): Promise<string> {
  const body = await res.json().catch(() => null) as { message?: string; error?: string } | null;
  return body?.message ?? "An unexpected error occurred";
}
