"use client";
import type { AnchorHTMLAttributes } from "react";
import styles from "./link-button.module.css";
export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  icon?: string;
}
/** A compact outlined navigation link. Use Button for actions. */
export function LinkButton({ href, icon, children, className, ...rest }: LinkButtonProps) {
  return <a {...rest} href={href} className={[styles.link, className].filter(Boolean).join(" ")}>
    {icon && <span className={"material-symbols-outlined " + styles.icon} aria-hidden="true">{icon}</span>}{children}
  </a>;
}
