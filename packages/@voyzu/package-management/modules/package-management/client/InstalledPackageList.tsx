"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { InstalledPackageResponseDto } from "../../types";
import { Badge, Breadcrumbs, Button, DataTable, FilterChips, FilterPanel, Input, Toast, ValidationAlert, type DataTableColumn, type FilterState, type FilterTab } from "@voyzu/ui-components";
import layout from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import detail from "@voyzu/ui-style/css-modules/detail.module.css";
import styles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

import localStyles from "./package-management.module.css";
import { PackageAccessDenied } from "./PackageAccessDenied";
import { HomePageRouteModal } from "./HomePageRouteModal";

const HELP_URL = "https://voyzu.gitbook.io/docs/guide/commands";
const FILTER_TABS: FilterTab[] = [
  { key: "installation", label: "Installation", type: "checkbox", options: ["Preinstalled", "Installed"] },
];

export function InstalledPackageList({
  pageTitle,
  canManage,
  initialPackages,
  initialHomePageRoute,
}: {
  pageTitle: string;
  canManage: boolean;
  initialPackages: InstalledPackageResponseDto[];
  initialHomePageRoute: string;
}) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<FilterState>({});
  const [homePageRoute, setHomePageRoute] = useState(initialHomePageRoute);
  const [homePageModalOpen, setHomePageModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const navigationPackages = packages.filter(({ hasTopNavigation }) => hasTopNavigation);
  const navigationIndex = new Map(navigationPackages.map((item, index) => [item.code, index]));

  const move = async (installedPackage: InstalledPackageResponseDto, direction: "up" | "down") => {
    setError("");
    const response = await fetch(`/api/installed-packages/${installedPackage.id}/navigation-order`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    setPackages(await response.json() as InstalledPackageResponseDto[]);
    setToast(`Moved ${installedPackage.code} ${direction}`);
    router.refresh();
  };

  const columns: DataTableColumn<InstalledPackageResponseDto>[] = [
    { key: "code", label: "Package", width: "18rem", render: (row) => <span className={localStyles.codeCell}>{row.code}</span> },
    { key: "description", label: "Description", render: (row) => row.description || "-" },
    { key: "installation", label: "Installation", width: "8rem", render: (row) => row.preinstalled ? "Preinstalled" : "Installed" },
    {
      key: "status",
      label: "Status",
      width: "7rem",
      align: "center",
      render: (row) => <Badge variant="soft" size="x-small" color={row.status === "ACTIVE" ? "success" : "neutral"}>{row.status}</Badge>,
    },
    {
      key: "order",
      label: "Top navigation",
      width: "12rem",
      align: "center",
      render: (row) => {
        if (!row.hasTopNavigation) return "-";
        const index = navigationIndex.get(row.code) ?? -1;
        return (
          <div className={localStyles.orderActions} onClick={(event) => event.stopPropagation()}>
            <Button variant="plain" size="small" icon="arrow_upward" title="Move up" disabled={index <= 0} onClick={() => { void move(row, "up"); }} />
            <Button variant="plain" size="small" icon="arrow_downward" title="Move down" disabled={index < 0 || index >= navigationPackages.length - 1} onClick={() => { void move(row, "down"); }} />
          </div>
        );
      },
    },
  ];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const installations = (activeFilters.installation as string[] | undefined) ?? [];
    return packages.filter((item) => {
      const matchesSearch = !query
        || item.code.toLowerCase().includes(query)
        || item.description.toLowerCase().includes(query);
      const installation = item.preinstalled ? "Preinstalled" : "Installed";
      return matchesSearch && (installations.length === 0 || installations.includes(installation));
    });
  }, [activeFilters, packages, search]);
  const hasActiveFilters = Object.values(activeFilters).some((value) => Array.isArray(value) && value.length > 0);

  if (!canManage) return <PackageAccessDenied pageTitle={pageTitle} />;

  const refresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const response = await fetch("/api/installed-package-reconciliation", { method: "POST" });
      if (!response.ok) {
        setError(await readError(response));
        return;
      }
      setPackages(await response.json() as InstalledPackageResponseDto[]);
      setToast("Package inventory refreshed from the filesystem");
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className={`${layout.listView} vz-grid-12`}>
      <header className={layout.listHeader}>
        <div className={layout.slotBreadcrumb}><Breadcrumbs /></div>
        <div className={layout.slotTitle}>
          <div className={styles.titleIcon}>
            <span className={`material-symbols-outlined ${styles.titleIconSymbol}`}>deployed_code</span>
          </div>
          <h1 className={`${typography.pageTitle} ${layout.pageTitleResponsive}`}>{pageTitle}</h1>
          <div className={layout.slotTitleByline}>
            <p className={typography.headingByline}>
              Installation and updates are controlled by Voyzu scripts. Use this Packages module to control package visibility, top navigation order and the application start page. <a className={localStyles.bylineLink} href={HELP_URL} target="_blank" rel="noreferrer">View package commands in online help.</a>
            </p>
          </div>
        </div>
      </header>

      <section className={`${layout.slotSummary} ${detail.card} ${detail.mutedCard} ${localStyles.homePagePanel}`}>
        <div className={localStyles.homePageSummary}>
          <span className={typography.fieldLabel}>Application start page</span>
          <p className={`${typography.bodyText} ${localStyles.homePageRoute}`}>{homePageRoute}</p>
        </div>
        <Button variant="plain" icon="edit" title="Change home page" onClick={() => setHomePageModalOpen(true)} />
      </section>

      <div className={layout.listToolbar}>
        <div className={layout.slotToolbarLeft}>
          <FilterPanel
            tabs={FILTER_TABS}
            filters={activeFilters}
            onApply={setActiveFilters}
            onClear={() => setActiveFilters({})}
            onRemoveFilter={(key) => setActiveFilters((current) => ({ ...current, [key]: [] }))}
            showChips={false}
          />
        </div>
        <div className={layout.slotToolbarSearch}>
          <Input search value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search packages..." />
        </div>
        <div className={layout.slotToolbarRight}>
          <div className={localStyles.toolbarActions}>
            <Button variant="plain" icon="sync" className={refreshing ? localStyles.spinning : undefined} disabled={refreshing} title="Refresh from filesystem" onClick={() => { void refresh(); }} />
          </div>
        </div>
      </div>

      {(hasActiveFilters || search.trim()) && (
        <div className={layout.chipsRow}>
          <div className={layout.slotChips}>
            <FilterChips
              tabs={FILTER_TABS}
              filters={activeFilters}
              additionalChips={search.trim()
                ? [{
                    key: "search",
                    label: "Search contains",
                    value: search.trim(),
                    onRemove: () => setSearch(""),
                  }]
                : []}
              onClear={() => {
                setActiveFilters({});
                setSearch("");
              }}
              onRemoveFilter={(key) => setActiveFilters((current) => ({ ...current, [key]: [] }))}
            />
          </div>
        </div>
      )}

      {error && <div className={layout.slotAlert}><ValidationAlert errors={[error]} visible onDismiss={() => setError("")} /></div>}

      <div className={layout.listBody}>
        <div className={layout.slotBody}>
          <DataTable
            columns={columns}
            rows={filtered}
            selectedIds={new Set<number>()}
            isAllSelected={false}
            isSomeSelected={false}
            onSelectAll={() => undefined}
            onSelectOne={() => undefined}
            noSelectionColumn
            onRowClick={(row) => router.push(`/settings/packages/${row.id}`)}
            currentPage={1}
            totalPages={1}
            onPageChange={() => undefined}
            totalCount={packages.length}
            filteredCount={filtered.length}
            itemLabel="packages"
            hasData={packages.length > 0}
            emptyIcon="deployed_code"
            emptyTitle="No packages"
            emptyText="Refresh the filesystem inventory"
            emptyFilterText="Try adjusting your search"
          />
        </div>
      </div>
      <Toast isVisible={Boolean(toast)} onClose={() => setToast("")} message={toast} />
      <HomePageRouteModal
        isOpen={homePageModalOpen}
        initialRoute={homePageRoute}
        onClose={() => setHomePageModalOpen(false)}
        onSaved={(route) => {
          setHomePageRoute(route);
          setToast("Application start page updated");
          router.refresh();
        }}
      />
    </div>
  );
}

async function readError(response: Response): Promise<string> {
  const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
  return body?.message ?? body?.error ?? "An unexpected error occurred";
}
