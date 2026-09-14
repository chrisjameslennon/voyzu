"use client";

import { activeNavigationArea, matchesPagePath } from "../common/nav";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useIsMobile } from "@voyzu/ui-layout";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";

interface PackageTopNavProps {
  domains: VoyzuComposedSurfaceDomain[];
  allDomains: VoyzuComposedSurfaceDomain[];
}


function currentPageStorageKey(domainId: string) {
  return `voyzu.currentPage.${domainId}`;
}

function rememberedPathFor(domain: VoyzuComposedSurfaceDomain): string | null {
  const rememberedPath = sessionStorage.getItem(currentPageStorageKey(domain.id));
  if (!rememberedPath) return null;

  const pathname = rememberedPath.split(/[?#]/, 1)[0] ?? "";
  return domain.routePaths.some(({ path }) => matchesPagePath(pathname, path))
    ? rememberedPath
    : null;
}

export function PackageTopNavClient({ domains, allDomains }: PackageTopNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const router = useRouter();
  const isMobile = useIsMobile();
  const activeDomain = activeNavigationArea(allDomains, pathname);
  const activeTopNavigationDomain = domains.find((domain) => domain.rootPath === activeDomain?.rootPath);

  useEffect(() => {
    if (!activeDomain) return;
    const currentPage = search ? `${pathname}?${search}` : pathname;
    sessionStorage.setItem(currentPageStorageKey(activeDomain.id), currentPage);
  }, [activeDomain, pathname, search]);

  const navigateToDomain = (domain: VoyzuComposedSurfaceDomain) => {
    router.push(rememberedPathFor(domain) ?? domain.defaultPath);
  };

  if (isMobile) {
    const isSettings = pathname.startsWith("/settings");
    const label = isSettings ? "Settings" : activeTopNavigationDomain?.label;
    if (!label) return null;

    return (
      <button
        className={`${styles.topNavButton} ${styles.topNavButtonActive}`}
        type="button"
        aria-label={label}
        onClick={() => {
          if (activeTopNavigationDomain) navigateToDomain(activeTopNavigationDomain);
        }}
      >
        {label}
      </button>
    );
  }

  return (
    <>
      {domains.map((domain) => (
        <button
          key={domain.id}
          className={[
            styles.topNavButton,
            domain.id === activeTopNavigationDomain?.id
              ? styles.topNavButtonActive
              : styles.topNavButtonInactive,
          ].join(" ")}
          type="button"
          aria-label={`Go to ${domain.label}`}
          onClick={() => navigateToDomain(domain)}
        >
          {domain.label}
        </button>
      ))}
    </>
  );
}
