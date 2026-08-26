"use client";

import type { ReactNode } from "react";
import { Fragment } from "react";
import { createContext, useContext } from "react";
import styles from "./breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbContextValue {
  base: readonly BreadcrumbItem[];
}

const BreadcrumbContext = createContext<BreadcrumbContextValue>({
  base: [],
});

interface BreadcrumbsProviderProps {
  base: readonly BreadcrumbItem[];
  children: ReactNode;
}

export function BreadcrumbsProvider({ base, children }: BreadcrumbsProviderProps) {
  return (
    <BreadcrumbContext.Provider value={{ base }}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

interface BreadcrumbsProps {
  slugs?: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ slugs, className }: BreadcrumbsProps) {
  const { base } = useContext(BreadcrumbContext);
  const resolvedItems = [...base, ...(slugs ?? [])];

  const renderItems = (breadcrumbItems: BreadcrumbItem[]) => (
    <>
      {breadcrumbItems.map((item, i) => (
        <Fragment key={i}>
          {item.href ? (
            <a href={item.href} className={styles.link}>{item.label}</a>
          ) : (
            <span className={styles.text}>{item.label}</span>
          )}
          <span className={styles.sep}>/</span>
        </Fragment>
      ))}
    </>
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${styles.breadcrumb}${className ? ` ${className}` : ""}`}
    >
      {renderItems(resolvedItems)}
    </nav>
  );
}
