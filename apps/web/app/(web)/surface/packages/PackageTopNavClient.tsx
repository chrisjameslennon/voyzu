"use client";

import { usePathname, useRouter } from "next/navigation";

import { useIsMobile } from "@voyzu/ui-layout";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import type { VoyzuComposedSurfaceDomain } from "@voyzu/ui-surface/types";

interface PackageTopNavProps {
  domains: VoyzuComposedSurfaceDomain[];
  allDomains: VoyzuComposedSurfaceDomain[];
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

export function PackageTopNavClient({ domains, allDomains }: PackageTopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  const activeDomain = allDomains.find((domain) =>
    domain.routePaths.some(({ path }) => routeMatches(pathname, path))
  );

  if (isMobile) {
    const isSettings = pathname.startsWith("/settings");
    const label = isSettings ? "Settings" : activeDomain?.label;
    if (!label) return null;

    return (
      <button
        className={`${styles.topNavButton} ${styles.topNavButtonActive}`}
        type="button"
        aria-label={label}
        onClick={() => {
          if (activeDomain) router.push(activeDomain.defaultPath);
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
            domain.id === activeDomain?.id
              ? styles.topNavButtonActive
              : styles.topNavButtonInactive,
          ].join(" ")}
          type="button"
          aria-label={`Go to ${domain.label}`}
          onClick={() => router.push(domain.defaultPath)}
        >
          {domain.label}
        </button>
      ))}
    </>
  );
}
