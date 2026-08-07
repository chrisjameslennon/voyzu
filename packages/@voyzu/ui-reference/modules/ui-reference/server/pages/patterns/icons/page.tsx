import { getSingletonHighlighter } from "shiki";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const SIZES = [
  { px: 16, desc: "Dense UI — data table actions, inline status indicators" },
  { px: 18, desc: "Compact — form field icons, chip labels" },
  { px: 20, desc: "Small — secondary toolbar actions" },
  { px: 24, desc: "Default — nav icons, primary toolbar buttons" },
  { px: 36, desc: "Page header icon — aligns with page title line-height" },
  { px: 48, desc: "Large — empty-state hero graphics" },
];

const ICON_COLORS = [
  { label: "inherited",       color: undefined,                                 desc: "Inherits parent text color (default)" },
  { label: "text-secondary",  color: "var(--voyzu-color-text-secondary)",        desc: "Toolbar / panel actions" },
  { label: "brand",           color: "var(--voyzu-color-brand)",                 desc: "Active state, nav icons" },
  { label: "success",         color: "var(--voyzu-color-success-text)",    desc: "Positive / success" },
  { label: "danger",          color: "var(--voyzu-color-danger-text)",     desc: "Error / destructive" },
];

const SETTING_SIZE_CODE = `<span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
  edit
</span>`;

const PAGE_HEADING_CODE = `<div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "1.5rem", alignItems: "center" }}>
  {/* Icon — col 1, row 1 */}
  <div style={{
    gridColumn: 1, gridRow: 1,
    background: "var(--voyzu-color-brand-soft)",
    borderRadius: "var(--voyzu-radius-control)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--voyzu-color-brand)",
    padding: "0.25rem",
    transform: "translateY(6px)",
  }}>
    <span
      className="material-symbols-outlined"
      style={{ fontSize: "36px", lineHeight: 1 }}
    >
      domain
    </span>
  </div>

  {/* h1 — col 2, row 1 */}
  <h1 className={typography.pageTitle} style={{ gridColumn: 2, gridRow: 1, margin: 0 }}>
    Companies
  </h1>

  {/* Byline — col 2, row 2. Col 1 row 2 is empty so byline left-aligns with h1. */}
  <p className={typography.headingByline} style={{ gridColumn: 2, gridRow: 2, margin: 0 }}>
    Manage your companies here.
  </p>
</div>`;

export default async function Page() {
  const [settingSizeHtml, pageHeadingHtml] = await Promise.all([
    highlight(SETTING_SIZE_CODE),
    highlight(PAGE_HEADING_CODE),
  ]);

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Patterns</p>
        <h1 className={pageStyles.title}>Icons</h1>
        <p className={pageStyles.description}>
          The app uses Google Material Symbols Outlined throughout. Icons are a font — size is
          controlled by <code>font-size</code>. Use semantic CSS variables for color.
        </p>
        <p className={pageStyles.description}>
          Material Symbols is an icon font published by Google, offering over 3,000 icons in a
          single variable font file. You can browse the full library and copy icon names at{" "}
          <a href="https://fonts.google.com/icons" target="_blank" rel="noreferrer" className={pageStyles.link}>
            fonts.google.com/icons
          </a>
          . Filter by the <strong>Outlined</strong> style to match the variant used in this app.
        </p>
        <div className={pageStyles.importBlock}>
          <code>{'<span className="material-symbols-outlined">icon_name</span>'}</code>
        </div>
      </div>

      {/* ── Sizes ── */}
      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Sizes</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          Common sizes used across the app. The Material Symbols default is 24px.
        </p>
        <div className={pageStyles.story}>
          <div className={pageStyles.preview} style={{ alignItems: "flex-end", gap: "2.5rem", flexWrap: "wrap" }}>
            {SIZES.map(({ px }) => (
              <div key={px} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: `${px}px`, color: "var(--voyzu-color-text)", lineHeight: 1 }}
                >
                  calendar_today
                </span>
                <code style={{ fontSize: "0.6875rem", color: "var(--voyzu-color-text-secondary)", fontFamily: "ui-monospace, Menlo, Consolas, monospace" }}>
                  {px}px
                </code>
              </div>
            ))}
          </div>
        </div>

        <h3 className={pageStyles.sectionTitle} style={{ marginTop: "1.5rem" }}>Setting size</h3>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          Control icon size with <code>font-size</code>. Do not set <code>width</code> or <code>height</code> — Material Symbols is a font and scales with <code>font-size</code> automatically.
        </p>
        <div className={pageStyles.story}>
          <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: settingSizeHtml! }} />
        </div>
      </section>

      {/* ── Coloring ── */}
      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Coloring</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          Icons inherit color from their parent. Set <code>color</code> with a CSS variable. The
          standard page-title icon (used on every list page) uses <code>--voyzu-color-brand</code>{" "}
          inside a <code>--voyzu-color-brand-soft</code> container with <code>--voyzu-radius-control</code>.
        </p>
        <div className={pageStyles.story}>
          <div className={pageStyles.preview} style={{ alignItems: "flex-end", gap: "3rem", flexWrap: "wrap" }}>
            {ICON_COLORS.map(({ label, color }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "24px", color: color ?? undefined, lineHeight: 1 }}
                >
                  account_balance
                </span>
                <code style={{ fontSize: "0.6875rem", color: "var(--voyzu-color-text-secondary)", fontFamily: "ui-monospace, Menlo, Consolas, monospace", textAlign: "center", maxWidth: "7rem" }}>
                  {label}
                </code>
              </div>
            ))}
          </div>
        </div>
        <div className={pageStyles.tableWrap} style={{ marginTop: "1rem" }}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Color token</th><th>Typical use</th></tr>
            </thead>
            <tbody>
              {ICON_COLORS.map(({ label, color, desc }) => (
                <tr key={label}>
                  <td><code className={pageStyles.propName}>{color ?? "(none)"}</code></td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Page heading ── */}
      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Page heading</h2>
        <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
          The standard layout for every list page. A CSS grid places the icon in column 1 row 1, the h1 in column 2 row 1, and the byline in column 2 row 2. Column 1 row 2 is intentionally empty, so the byline left-aligns with the heading text rather than the icon.
        </p>
        <div className={pageStyles.story}>
          <div className={pageStyles.preview} style={{ flexDirection: "column", alignItems: "flex-start", gap: "1.5rem" }}>
            {([
              { icon: "domain",       title: "Companies", byline: "Manage your companies here." },
              { icon: "receipt_long", title: "Invoices",  byline: "Create and manage customer invoices." },
            ] as { icon: string; title: string; byline: string }[]).map(({ icon, title, byline }) => (
              <div key={title} style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "1.5rem", alignItems: "center" }}>
                <div style={{
                  gridColumn: 1, gridRow: 1,
                  background: "var(--voyzu-color-brand-soft)",
                  borderRadius: "var(--voyzu-radius-control)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--voyzu-color-brand)",
                  padding: "0.25rem",
                  transform: "translateY(6px)",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "36px", lineHeight: 1 }}>
                    {icon}
                  </span>
                </div>
                <h1 style={{
                  gridColumn: 2, gridRow: 1,
                  fontFamily: "var(--voyzu-font-family-heading)",
                  fontSize: "var(--voyzu-font-size-page-title)",
                  fontWeight: "var(--voyzu-font-weight-page-title)",
                  color: "var(--voyzu-color-text-heading)",
                  lineHeight: "var(--voyzu-line-height-heading)",
                  margin: 0,
                }}>
                  {title}
                </h1>
                <p style={{
                  gridColumn: 2, gridRow: 2,
                  fontSize: "var(--voyzu-font-size-body)",
                  fontWeight: "var(--voyzu-font-weight-body-light)",
                  color: "var(--voyzu-color-text-heading)",
                  lineHeight: "var(--voyzu-line-height-body)",
                  margin: 0,
                }}>
                  {byline}
                </p>
              </div>
            ))}
          </div>
          <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: pageHeadingHtml! }} />
        </div>
      </section>
    </main>
  );
}
