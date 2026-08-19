import styles from "@voyzu/ui-surface/css-modules/surface.module.css";

interface HelpButtonProps {
  href: string;
}

export function HelpButton({ href }: HelpButtonProps) {
  return (
    <a
      className={styles.iconButton}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Help"
    >
      <span className="material-symbols-outlined">help</span>
    </a>
  );
}
