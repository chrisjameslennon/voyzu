"use client";

import { activeNavigationArea, matchesPagePath } from "../common/nav";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LeftNav, MobileNavDrawer, type NavGroup } from "@voyzu/ui-components";
import { useIsTablet } from "@voyzu/ui-layout";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";
import {
  PackageLeftNavHeader as PreInstalledPackageLeftNavHeader,
  hasPackageLeftNavHeader as hasPreInstalledPackageLeftNavHeader,
} from "../../../.generated/navigation/pre-installed-headers";
import {
  PackageLeftNavHeader as InstalledPackageLeftNavHeader,
  hasPackageLeftNavHeader as hasInstalledPackageLeftNavHeader,
} from "../../../.generated/navigation/installed-headers";

import { toNavItem } from "../common/nav";

interface PackageLeftNavProps {
  domains: VoyzuComposedSurfaceDomain[];
  navigationDomains: VoyzuComposedSurfaceDomain[];
}


export function PackageLeftNav({ domains, navigationDomains }: PackageLeftNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isTablet = useIsTablet();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const effectiveIsCollapsed = isTablet || isCollapsed;
  const activeDomain = activeNavigationArea(domains, pathname);

  const routePathById = new Map(
    (activeDomain?.linkPaths ?? []).map(({ id, path }) => [id, path]),
  );
  const groups: NavGroup[] = (activeDomain?.leftNav ?? []).map((group) => ({
    label: group.label,
    items: group.items.map((item) => toNavItem(item, routePathById)),
  }));
  const hasPreInstalledHeader = activeDomain
    ? hasPreInstalledPackageLeftNavHeader(activeDomain.packageName, activeDomain.rootPath)
    : false;
  const hasInstalledHeader = activeDomain
    ? hasInstalledPackageLeftNavHeader(activeDomain.packageName, activeDomain.rootPath)
    : false;
  const handleNavigate = (path: string) => {
    if (!path.startsWith("#")) router.push(path);
  };

  return (
    <>
      <button
        className={styles.mobileNavButton}
        type="button"
        aria-label="Open navigation"
        onClick={() => setIsMobileDrawerOpen(true)}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>
      <div className={styles.desktopLeftNav}>
        <LeftNav
          groups={groups}
          currentPath={pathname}
          onNavigate={handleNavigate}
          isCollapsed={effectiveIsCollapsed}
          setIsCollapsed={setIsCollapsed}
          isCollapseLocked={isTablet}
          headerSlot={hasPreInstalledHeader ? (
            <PreInstalledPackageLeftNavHeader
              packageName={activeDomain!.packageName}
              rootPath={activeDomain!.rootPath}
              presentation={effectiveIsCollapsed ? "collapsed" : "expanded"}
            />
          ) : hasInstalledHeader ? (
            <InstalledPackageLeftNavHeader
              packageName={activeDomain!.packageName}
              rootPath={activeDomain!.rootPath}
              presentation={effectiveIsCollapsed ? "collapsed" : "expanded"}
            />
          ) : undefined}
        />
      </div>
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        domains={navigationDomains.map(({ label }) => label)}
        activeDomain={activeDomain?.label ?? ""}
        onSelectDomain={(label) => {
          const domain = navigationDomains.find((item) => item.label === label);
          if (domain) router.push(domain.defaultPath);
        }}
        navSections={groups.map((group) => ({
          sectionLabel: group.label,
          items: group.items,
        }))}
        currentPath={pathname}
        onNavigate={handleNavigate}
        headerSlot={isMobileDrawerOpen && activeDomain ? (
          hasPreInstalledHeader ? <PreInstalledPackageLeftNavHeader packageName={activeDomain.packageName} rootPath={activeDomain.rootPath} presentation="mobile" />
            : hasInstalledHeader ? <InstalledPackageLeftNavHeader packageName={activeDomain.packageName} rootPath={activeDomain.rootPath} presentation="mobile" /> : undefined
        ) : undefined}
        showCompanySelector={false}
        logoSrc="/voyzu/voyzu_color_logo_transparent.png"
      />
    </>
  );
}
