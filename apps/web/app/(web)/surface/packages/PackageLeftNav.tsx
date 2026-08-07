"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LeftNav, MobileNavDrawer, type NavGroup } from "@voyzu/ui-components";
import { useIsTablet } from "@voyzu/ui-layout";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";
import {
  ComposedPackageLeftNavHeader,
  hasComposedPackageLeftNavHeader,
} from "../../../../../../generated-composition/package-left-nav-headers.generated";

import { toNavItem } from "../common/nav";

interface PackageLeftNavProps {
  domains: VoyzuComposedSurfaceDomain[];
  navigationDomains: VoyzuComposedSurfaceDomain[];
}

function routeMatches(pathname: string, routePath: string) {
  const routeSegments = routePath.split("/");
  const pathSegments = pathname.split("/");
  if (routeSegments.length !== pathSegments.length) return false;

  return routeSegments.every(
    (segment, index) =>
      (segment.startsWith("[") && segment.endsWith("]"))
      || segment === pathSegments[index],
  );
}

export function PackageLeftNav({ domains, navigationDomains }: PackageLeftNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isTablet = useIsTablet();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const effectiveIsCollapsed = isTablet || isCollapsed;
  const activeDomain = domains.find((domain) =>
    domain.routePaths.some(({ path }) => routeMatches(pathname, path))
  );

  const routePathById = new Map(
    (activeDomain?.routePaths ?? []).map(({ id, path }) => [id, path]),
  );
  const groups: NavGroup[] = (activeDomain?.leftNav ?? []).map((group) => ({
    label: group.label,
    items: group.items.map((item) => toNavItem(item, routePathById)),
  }));
  const hasLeftNavHeader = activeDomain
    ? hasComposedPackageLeftNavHeader(activeDomain.packageName, pathname)
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
          headerSlot={hasLeftNavHeader ? (
            <ComposedPackageLeftNavHeader
              packageName={activeDomain!.packageName}
              isCollapsed={effectiveIsCollapsed}
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
        showCompanySelector={false}
        logoSrc="/voyzu/voyzu_color_logo_transparent.png"
      />
    </>
  );
}
