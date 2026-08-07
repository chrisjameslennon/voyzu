import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import pageStyles from "../../page.module.css";
import styles from "./page.module.css";

const SAMPLE_TEXT = "Lorem ipsum dolor sit amet";

const TOKEN_PRIMITIVES: Record<string, string> = {
  "--voyzu-color-brand": "--_brand-primary",
  "--voyzu-color-brand-hover": "--_brand-primary-hover",
  "--voyzu-color-brand-soft": "--_brand-primary-light",
  "--voyzu-color-brand-subtle": "--_brand-primary-subtle",
  "--voyzu-color-background": "--_brand-background",
  "--voyzu-color-surface": "--tw-color-white",
  "--voyzu-color-surface-secondary": "--tw-color-gray-100",
  "--voyzu-color-surface-muted": "--tw-color-gray-50",
  "--voyzu-color-surface-border": "--tw-color-gray-200",
  "--voyzu-color-text": "--tw-color-gray-800",
  "--voyzu-color-text-heading": "--tw-color-gray-900",
  "--voyzu-color-text-label": "--tw-color-gray-700",
  "--voyzu-color-text-caption": "--tw-color-gray-600",
  "--voyzu-color-text-secondary": "--tw-color-gray-500",
  "--voyzu-color-text-tertiary": "--tw-color-gray-400",
  "--voyzu-color-text-help": "--tw-color-gray-400",
  "--voyzu-color-text-placeholder": "--tw-color-gray-400",
  "--voyzu-color-text-disabled": "--tw-color-gray-300",
  "--voyzu-color-text-inverse": "--tw-color-white",
  "--voyzu-color-link": "--tw-color-blue-600",
  "--voyzu-color-link-hover": "--tw-color-blue-700",
  "--voyzu-color-border": "--tw-color-gray-200",
  "--voyzu-color-border-strong": "--tw-color-gray-300",
  "--voyzu-color-primary-surface": "--tw-color-blue-50",
  "--voyzu-color-primary-surface-strong": "--tw-color-blue-100",
  "--voyzu-color-primary-border": "--tw-color-blue-200",
  "--voyzu-color-primary-border-strong": "--tw-color-blue-300",
  "--voyzu-color-primary-focus-ring": "--tw-color-blue-400",
  "--voyzu-color-primary-base": "--tw-color-blue-500",
  "--voyzu-color-primary-text-strong": "--tw-color-blue-800",
  "--voyzu-color-primary-text-emphasis": "--tw-color-blue-900",
  "--voyzu-color-brand-base": "--voyzu-color-brand",
  "--voyzu-color-brand-bg": "--voyzu-color-brand-subtle",
  "--voyzu-color-brand-text": "--voyzu-color-brand",
  "--voyzu-color-brand-border": "--voyzu-color-brand-soft",
  "--voyzu-color-info": "--voyzu-color-primary-base",
  "--voyzu-color-info-base": "--voyzu-color-primary-base",
  "--voyzu-color-info-bg": "--voyzu-color-primary-surface",
  "--voyzu-color-info-text": "--voyzu-color-primary-text-strong",
  "--voyzu-color-info-hover": "--voyzu-color-primary-text-emphasis",
  "--voyzu-color-info-border": "--voyzu-color-primary-border-strong",
  "--voyzu-color-success": "--tw-color-green-600",
  "--voyzu-color-success-base": "--tw-color-green-500",
  "--voyzu-color-success-bg": "--tw-color-green-50",
  "--voyzu-color-success-text": "--tw-color-green-700",
  "--voyzu-color-success-hover": "--tw-color-green-700",
  "--voyzu-color-success-border": "--tw-color-green-300",
  "--voyzu-color-warning": "--tw-color-orange-600",
  "--voyzu-color-warning-base": "--tw-color-orange-500",
  "--voyzu-color-warning-bg": "--tw-color-orange-50",
  "--voyzu-color-warning-text": "--tw-color-orange-700",
  "--voyzu-color-warning-hover": "--tw-color-orange-700",
  "--voyzu-color-warning-border": "--tw-color-orange-100",
  "--voyzu-color-danger": "--tw-color-red-600",
  "--voyzu-color-danger-base": "--tw-color-red-500",
  "--voyzu-color-danger-bg": "--tw-color-red-50",
  "--voyzu-color-danger-text": "--tw-color-red-700",
  "--voyzu-color-danger-hover": "--tw-color-red-700",
  "--voyzu-color-danger-border": "--tw-color-red-100",
  "--voyzu-color-neutral": "--tw-color-gray-200",
  "--voyzu-color-neutral-base": "--tw-color-gray-200",
  "--voyzu-color-neutral-bg": "--tw-color-gray-100",
  "--voyzu-color-neutral-text": "--tw-color-gray-700",
  "--voyzu-color-neutral-hover": "--tw-color-gray-700",
  "--voyzu-color-neutral-border": "--tw-color-gray-300",
  "--voyzu-color-plain": "--tw-color-white",
  "--voyzu-color-plain-base": "--tw-color-white",
  "--voyzu-color-plain-bg": "--tw-color-white",
  "--voyzu-color-plain-text": "--tw-color-gray-500",
  "--voyzu-color-plain-hover": "--tw-color-gray-800",
  "--voyzu-color-plain-border": "--tw-color-gray-200",
  "--voyzu-color-overlay": "--wa-color-overlay-modal",
  "--voyzu-avatar-color": "--wa-color-indigo-40",
  "--voyzu-avatar-color-hover": "--wa-color-indigo-30",
  "--voyzu-avatar-color-focus": "--wa-color-indigo-50",
  "--voyzu-color-scrollbar-track": "--tw-color-gray-100",
  "--voyzu-color-scrollbar-thumb": "--voyzu-color-border-strong",
  "--voyzu-color-scrollbar-thumb-hover": "--voyzu-color-text-tertiary",
};

const COLOR_GROUPS = [
  {
    title: "Brand / Primary Actions",
    tokens: [
      "--voyzu-color-brand",
      "--voyzu-color-brand-hover",
      "--voyzu-color-brand-soft",
      "--voyzu-color-brand-subtle",
    ],
  },
  {
    title: "App Surfaces",
    tokens: [
      "--voyzu-color-background",
      "--voyzu-color-surface",
      "--voyzu-color-surface-secondary",
      "--voyzu-color-surface-muted",
      "--voyzu-color-surface-border",
      "--voyzu-color-overlay",
    ],
  },
  {
    title: "Text",
    tokens: [
      "--voyzu-color-text",
      "--voyzu-color-text-heading",
      "--voyzu-color-text-label",
      "--voyzu-color-text-caption",
      "--voyzu-color-text-secondary",
      "--voyzu-color-text-tertiary",
      "--voyzu-color-text-help",
      "--voyzu-color-text-placeholder",
      "--voyzu-color-text-disabled",
      "--voyzu-color-text-inverse",
    ],
  },
  {
    title: "Links",
    tokens: [
      "--voyzu-color-link",
      "--voyzu-color-link-hover",
    ],
  },
  {
    title: "Borders",
    tokens: [
      "--voyzu-color-border",
      "--voyzu-color-border-strong",
    ],
  },
  {
    title: "Primary Interactive Scale",
    tokens: [
      "--voyzu-color-primary-surface",
      "--voyzu-color-primary-surface-strong",
      "--voyzu-color-primary-border",
      "--voyzu-color-primary-border-strong",
      "--voyzu-color-primary-focus-ring",
      "--voyzu-color-primary-base",
      "--voyzu-color-primary-text-strong",
      "--voyzu-color-primary-text-emphasis",
    ],
  },
  {
    title: "Generic Semantic Feedback",
    tokens: [
      "--voyzu-color-brand-base",
      "--voyzu-color-brand-bg",
      "--voyzu-color-brand-text",
      "--voyzu-color-brand-hover",
      "--voyzu-color-brand-border",
      "--voyzu-color-info",
      "--voyzu-color-info-bg",
      "--voyzu-color-info-text",
      "--voyzu-color-info-hover",
      "--voyzu-color-info-border",
      "--voyzu-color-info-base",
      "--voyzu-color-success",
      "--voyzu-color-success-bg",
      "--voyzu-color-success-text",
      "--voyzu-color-success-hover",
      "--voyzu-color-success-border",
      "--voyzu-color-success-base",
      "--voyzu-color-warning",
      "--voyzu-color-warning-bg",
      "--voyzu-color-warning-text",
      "--voyzu-color-warning-hover",
      "--voyzu-color-warning-border",
      "--voyzu-color-warning-base",
      "--voyzu-color-danger",
      "--voyzu-color-danger-bg",
      "--voyzu-color-danger-text",
      "--voyzu-color-danger-hover",
      "--voyzu-color-danger-border",
      "--voyzu-color-danger-base",
      "--voyzu-color-neutral",
      "--voyzu-color-neutral-bg",
      "--voyzu-color-neutral-text",
      "--voyzu-color-neutral-hover",
      "--voyzu-color-neutral-border",
      "--voyzu-color-neutral-base",
      "--voyzu-color-plain",
      "--voyzu-color-plain-bg",
      "--voyzu-color-plain-text",
      "--voyzu-color-plain-hover",
      "--voyzu-color-plain-border",
      "--voyzu-color-plain-base",
    ],
  },
  {
    title: "User Avatar",
    tokens: [
      "--voyzu-avatar-color",
      "--voyzu-avatar-color-hover",
      "--voyzu-avatar-color-focus",
    ],
  },
  {
    title: "Scrollbars",
    tokens: [
      "--voyzu-color-scrollbar-track",
      "--voyzu-color-scrollbar-thumb",
      "--voyzu-color-scrollbar-thumb-hover",
    ],
  },
] satisfies { title: string; tokens: string[] }[];

const DARK_SAMPLE_TOKENS = new Set([
  "--voyzu-color-surface",
  "--voyzu-color-text-inverse",
]);

export default function Page() {
  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>CSS Variables</p>
        <h1 className={pageStyles.title}>Colors</h1>
        <p className={pageStyles.description}>
          Public colour tokens from <code>lib/ui-style/src/css/design-tokens.css</code>, grouped by the same sections as the source file.
        </p>
        <p className={typography.fieldHelp}>
          Use these variable names directly in CSS as <code>var(--voyzu-color-...)</code>.
        </p>
      </div>

      <div className={styles.groupList}>
        {COLOR_GROUPS.map((group) => (
          <section key={group.title} className={pageStyles.section}>
            <h2 className={pageStyles.sectionTitle}>{group.title}</h2>
            <div className={styles.tokenGrid}>
              {group.tokens.map((token) => {
                const isDarkSample = DARK_SAMPLE_TOKENS.has(token);
                return (
                  <div className={styles.tokenRow} key={token}>
                    <code className={styles.tokenName}>{token}</code>
                    <div
                      className={`${styles.sample} ${isDarkSample ? styles.darkSample : ""}`}
                      style={{ color: `var(${token})` }}
                    >
                      {SAMPLE_TEXT}
                    </div>
                    <div className={styles.swatch} style={{ background: `var(${token})` }} />
                    <code className={styles.primitiveName}>{TOKEN_PRIMITIVES[token] ?? "—"}</code>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
