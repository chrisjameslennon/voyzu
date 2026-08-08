"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { InstalledPackageResponseDto } from "../../types";
import { Badge, Breadcrumbs, Button, DropdownMenu, Toast, ToggleSwitch, ValidationAlert, type DropdownMenuItem } from "@voyzu/ui-components";
import { DetailBackButton } from "@voyzu/ui-surface/client";
import layout from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detail from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import localStyles from "./package-management.module.css";

import { ChangePageRouteVisibility } from "../domain/operation-policy";
import { PackageAccessDenied } from "./PackageAccessDenied";

interface InstalledPackageFiles {
  packageJson: string;
  packageJsonHtml: string;
  packageDefinition: string;
  packageDefinitionHtml: string;
}

type PackageFileView = "package-json" | "package-definition";

export function InstalledPackageDetail({
  pageTitle,
  canManage,
  installedPackage: initialPackage,
  packageFiles,
}: {
  pageTitle: string;
  canManage: boolean;
  installedPackage: InstalledPackageResponseDto | null;
  packageFiles: InstalledPackageFiles | null;
}) {
  const router = useRouter();
  const [installedPackage, setInstalledPackage] = useState(initialPackage);
  const [topNavigationVisible, setTopNavigationVisible] = useState(initialPackage?.topNavigationVisible ?? true);
  const [pageRoutesVisible, setPageRoutesVisible] = useState(initialPackage?.pageRoutesVisible ?? true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [fileView, setFileView] = useState<PackageFileView | null>(null);

  if (!canManage) return <PackageAccessDenied pageTitle={pageTitle} />;
  if (!installedPackage) return null;

  const pageRouteVisibilityBlockers = ChangePageRouteVisibility(installedPackage, false);
  const pageRouteVisibilityLocked = pageRouteVisibilityBlockers.length > 0;
  const viewItems: DropdownMenuItem[] = [
    {
      value: "package-json",
      label: "View package.json",
      icon: "data_object",
      disabled: !packageFiles,
      onSelect: () => setFileView("package-json"),
    },
    {
      value: "package-definition",
      label: "View voyzu.package.ts",
      icon: "code",
      disabled: !packageFiles,
      onSelect: () => setFileView("package-definition"),
    },
  ];

  const save = async () => {
    setError("");
    const response = await fetch(`/api/installed-packages/${installedPackage.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topNavigationVisible, pageRoutesVisible }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
      setError(body?.message ?? body?.error ?? "An unexpected error occurred");
      return;
    }
    const updated = await response.json() as InstalledPackageResponseDto;
    setInstalledPackage(updated);
    setTopNavigationVisible(updated.topNavigationVisible);
    setPageRoutesVisible(updated.pageRoutesVisible);
    setToast(`Updated ${updated.code}`);
    router.refresh();
  };

  return (
    <div className={`${layout.detailView} ${layout.detailViewWithStatusRail}`}>
      <header className={layout.detailHeader}>
        <div className={layout.slotBreadcrumb}><Breadcrumbs /></div>
        <div className={layout.slotTitle}>
          <div className={detail.title}>
            <div className={detail.titleIcon}><span className={`material-symbols-outlined ${detail.titleIconSymbol}`}>deployed_code</span></div>
            <h1 className={typography.pageTitle}>{installedPackage.code}</h1>
          </div>
        </div>
        <div className={layout.slotActions}><DetailBackButton fallbackHref="/settings/packages" /></div>
      </header>

      {error && <div className={layout.slotAlert}><ValidationAlert errors={[error]} visible onDismiss={() => setError("")} /></div>}

      <aside className={layout.statusSection}>
        <div className={detail.card}>
          <div className={detail.fieldGroup}>
            <span className={typography.fieldLabel}>Page routes</span>
            <Badge variant="soft" size="x-large" color={pageRoutesVisible ? "success" : "neutral"}>{pageRoutesVisible ? "VISIBLE" : "HIDDEN"}</Badge>
          </div>
        </div>
        <div className={detail.systemCard}>
          <DropdownMenu
            trigger={
              <Button variant="secondary" icon="visibility" className={detail.fullWidthAction} textAlign="center">
                View
              </Button>
            }
            items={viewItems}
            caret
            alignment="left"
            width={300}
          />
        </div>
      </aside>

      <main className={layout.mainSection}>
        <section className={detail.card}>
          <div className={detail.cardHeader}>
            <h2 className={`${typography.sectionHeading} ${detail.cardHeaderTitle}`}>Package Details</h2>
            <div className={detail.cardHeaderActions}>
              <Button
                variant="secondary"
                icon="save"
                onClick={() => { void save(); }}
              >
                Save
              </Button>
            </div>
          </div>
          <div className={detail.formGrid}>
            <div className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>Package name</span>
              <p className={typography.bodyText}>{installedPackage.code}</p>
            </div>
            <div className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>Installation</span>
              <p className={typography.bodyText}>{installedPackage.preinstalled ? "Preinstalled" : "Installed"}</p>
            </div>
            <div className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>Description</span>
              <p className={typography.bodyText}>{installedPackage.description || "-"}</p>
            </div>
            <div className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>Repository</span>
              {installedPackage.repository
                ? <a className={typography.link} href={installedPackage.repository} target="_blank" rel="noreferrer">{installedPackage.repository}</a>
                : <p className={typography.bodyText}>-</p>}
            </div>
            <div className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>Page root paths</span>
              <p className={typography.bodyText}>{installedPackage.pageRootPaths.join(", ") || "None"}</p>
            </div>
            <div className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>API root paths</span>
              <p className={typography.bodyText}>{installedPackage.apiRootPaths.join(", ") || "None"}</p>
            </div>
            <label className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>Show top navigation</span>
              <ToggleSwitch
                checked={topNavigationVisible}
                onChange={setTopNavigationVisible}
                disabled={!installedPackage.hasTopNavigation}
              />
              {!installedPackage.hasTopNavigation && <span className={typography.fieldHelp}>This package does not provide top-navigation items.</span>}
            </label>
            <label className={detail.fieldGroup}>
              <span className={typography.fieldLabel}>Show page routes</span>
              <ToggleSwitch
                checked={pageRoutesVisible}
                onChange={setPageRoutesVisible}
                disabled={pageRouteVisibilityLocked}
              />
              {pageRouteVisibilityLocked && <span className={typography.fieldHelp}>{pageRouteVisibilityBlockers[0]?.message}.</span>}
            </label>
          </div>
        </section>
      </main>
      {fileView && packageFiles && (
        <PackageFileModal
          title={fileView === "package-json" ? "package.json" : "voyzu.package.ts"}
          value={fileView === "package-json" ? packageFiles.packageJson : packageFiles.packageDefinition}
          html={fileView === "package-json" ? packageFiles.packageJsonHtml : packageFiles.packageDefinitionHtml}
          onClose={() => setFileView(null)}
        />
      )}
      <Toast isVisible={Boolean(toast)} onClose={() => setToast("")} message={toast} />
    </div>
  );
}

function PackageFileModal({
  title,
  value,
  html,
  onClose,
}: {
  title: string;
  value: string;
  html: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    void navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={localStyles.modalOverlay} onClick={onClose}>
      <div className={localStyles.modal} onClick={(event) => event.stopPropagation()}>
        <header className={localStyles.modalHeader}>
          <strong>{title}</strong>
          <div className={localStyles.modalActions}>
            <Button variant="secondary" icon={copied ? "check" : "content_copy"} onClick={copy}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="plain" icon="close" title="Close" onClick={onClose} />
          </div>
        </header>
        <div className={localStyles.modalCode} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
