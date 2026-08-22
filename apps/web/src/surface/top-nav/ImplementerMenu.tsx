"use client";

import { useRouter } from "next/navigation";
import { DropdownMenu, type DropdownMenuItem } from "@voyzu/ui-components";
import styles from "@voyzu/ui-surface/css-modules/surface.module.css";
import { useCurrentUserAccess } from "../common/useCurrentUserAccess";

interface ImplementerMenuProps {
  pageApiHref?: string;
  apiReferenceVisible: boolean;
  uiReferenceVisible: boolean;
}

export function ImplementerMenu({
  pageApiHref,
  apiReferenceVisible,
  uiReferenceVisible,
}: ImplementerMenuProps) {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUserAccess();

  if (!isLoaded || !user?.implementerAccess) return null;

  const items: DropdownMenuItem[] = [
    {
      value: "page-api",
      label: "Show API for this page",
      icon: "api",
      disabled: !pageApiHref,
      onSelect: () => {
        if (pageApiHref) window.open(pageApiHref, "_blank", "noopener,noreferrer");
      },
    },
  ];

  if (apiReferenceVisible) {
    items.push({
      value: "api-reference",
      label: "API Reference Application",
      icon: "menu_book",
      onSelect: () => router.push("/api-reference"),
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
