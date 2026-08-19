"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { LeftNav, MobileNavDrawer, type NavGroup } from "@voyzu/ui-components";
import { useIsTablet } from "@voyzu/ui-layout";
import type {
  VoyzuComposedSurfaceDomain,
  VoyzuSurfaceNavGroup,
} from "@voyzu/ui-surface/types";

import { toNavItem, type SurfaceRoutePath } from "../../common/nav";
import { canAccessRole, useCurrentUserAccess } from "../../common/useCurrentUserAccess";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";

interface SettingsLeftNavProps {
  routePaths: SurfaceRoutePath[];
  leftNav: VoyzuSurfaceNavGroup[];
  navigationDomains: VoyzuComposedSurfaceDomain[];
}

export function SettingsLeftNav({
  routePaths,
  leftNav,
  navigationDomains,
}: SettingsLeftNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isTablet = useIsTablet();
  const { user, isLoaded } = useCurrentUserAccess();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const effectiveIsCollapsed = isTablet || isCollapsed;
  const routePathById = new Map(routePaths.map((route) => [route.id, route.path]));
  const visibleLeftNav = isLoaded && canAccessRole(user, "ADMIN") ? leftNav : [];
  const groups: NavGroup[] = visibleLeftNav.map((group) => ({
    label: group.label,
    items: group.items.map((item) => toNavItem(item, routePathById)),
  }));

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
        />
      </div>
      <MobileNavDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        domains={navigationDomains.map(({ label }) => label)}
        activeDomain="Settings"
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
