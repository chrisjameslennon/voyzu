"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu, type DropdownMenuItem } from "@voyzu/ui-components";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { useCurrentUserAccess } from "../common/useCurrentUserAccess";

interface ImplementerMenuProps {
  pageHttpApiHref?: string;
  httpApiReferenceVisible: boolean;
  uiReferenceVisible: boolean;
}

export function ImplementerMenu({
  pageHttpApiHref,
  httpApiReferenceVisible,
  uiReferenceVisible,
}: ImplementerMenuProps) {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUserAccess();

  if (!isLoaded || !user?.implementerAccess) return null;

  const items: DropdownMenuItem[] = [
    {
      value: "page-api",
      label: "Show HTTP API for this page",
      icon: "api",
      disabled: !pageHttpApiHref,
      onSelect: () => {
        if (pageHttpApiHref) window.open(pageHttpApiHref, "_blank", "noopener,noreferrer");
      },
    },
  ];

  if (httpApiReferenceVisible) {
    items.push({
      value: "http-api-reference",
      label: "HTTP API Reference Application",
      icon: "menu_book",
      onSelect: () => router.push("/http-api-reference"),
    });
  }

  if (uiReferenceVisible) {
    items.push({
      value: "ui-reference",
      label: "UI Reference Application",
      icon: "widgets",
      onSelect: () => router.push("/ui-reference"),
    });
  }

  return (
    <DropdownMenu
      alignment="right"
      width={280}
      trigger={(
        <button
          className={styles.iconButton}
          type="button"
          aria-label="Implementer tools"
          title="Implementer tools"
        >
          <span className="material-symbols-outlined">code</span>
        </button>
      )}
      items={items}
    />
  );
}
