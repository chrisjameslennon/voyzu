import styles from "@voyzu/ui-surface/css-modules/surface.module.css";

export function VoyzuBrand() {
  return (
    <img
      className={styles.brandLogo}
      src="/voyzu/voyzu_color_logo_transparent.png"
      alt="Voyzu"
    />
  );
}
