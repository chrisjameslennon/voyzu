import { getSingletonHighlighter } from "shiki";

import { Badge } from "@voyzu/ui-components";
import pageStyles from "../../page.module.css";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const COLORS = ["info", "success", "warning", "danger", "neutral", "plain"] as const;
const SIZES = ["x-small", "small", "medium", "large", "x-large"] as const;
const VARIANTS = ["soft", "solid", "outline"] as const;
const CUSTOM_COLORS = [
  { label: "REVENUE", colors: { fg: "#166534", bg: "#dcfce7", border: "#86efac" } },
  { label: "EXPENSE", colors: { fg: "#7c2d12", bg: "#fee2e2", border: "#fca5a5" } },
  { label: "COGS", colors: { fg: "#92400e", bg: "#fef3c7", border: "#fcd34d" } },
  { label: "TAX", colors: { fg: "#1e3a8a", bg: "#dbeafe", border: "#93c5fd" } },
  { label: "CASH", colors: { fg: "#134e4a", bg: "#ccfbf1", border: "#5eead4" } },
] as const;

const STORIES = [
  {
    name: "Sizes",
    description: "X-small fits dense data-grid rows. X-large matches the larger status chips used on detail screens.",
    preview: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {SIZES.map((size) => (
          <Badge key={size} variant="soft" size={size} color="success">
            {size}
          </Badge>
        ))}
      </div>
    ),
    code: `<Badge variant="soft" size="x-small" color="success">x-small</Badge>
<Badge variant="soft" size="small" color="success">small</Badge>
<Badge variant="soft" size="medium" color="success">medium</Badge>
<Badge variant="soft" size="large" color="success">large</Badge>
<Badge variant="soft" size="x-large" color="success">x-large</Badge>`,
  },
  {
    name: "Colors",
    description: "Info is blue, neutral follows the cancel button palette, and plain follows the plain button palette.",
    preview: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {COLORS.map((color) => (
          <Badge key={color} variant="soft" size="medium" color={color}>
            {color}
          </Badge>
        ))}
      </div>
    ),
    code: `<Badge variant="soft" size="medium" color="info">info</Badge>
<Badge variant="soft" size="medium" color="success">success</Badge>
<Badge variant="soft" size="medium" color="warning">warning</Badge>
<Badge variant="soft" size="medium" color="danger">danger</Badge>
<Badge variant="soft" size="medium" color="neutral">neutral</Badge>
<Badge variant="soft" size="medium" color="plain">plain</Badge>`,
  },
  {
    name: "Variants",
    description: "Use soft for normal status labels, solid for stronger emphasis, and outline where the background should stay quiet.",
    preview: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {VARIANTS.map((variant) => (
          <Badge key={variant} variant={variant} size="medium" color="info">
            {variant}
          </Badge>
        ))}
      </div>
    ),
    code: `<Badge variant="soft" size="medium" color="info">soft</Badge>
<Badge variant="solid" size="medium" color="info">solid</Badge>
<Badge variant="outline" size="medium" color="info">outline</Badge>`,
  },
  {
    name: "Icons",
    description: "Set icon to a Material Symbols name when a badge needs an additional visual status cue.",
    preview: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <Badge variant="soft" size="medium" color="neutral" icon="lock">Archived</Badge>
        <Badge variant="soft" size="medium" color="success" icon="check_circle">Active</Badge>
        <Badge variant="soft" size="medium" color="warning" icon="warning">Review</Badge>
      </div>
    ),
    code: `<Badge variant="soft" size="medium" color="neutral" icon="lock">
  Archived
</Badge>
<Badge variant="soft" size="medium" color="success" icon="check_circle">
  Active
</Badge>
<Badge variant="soft" size="medium" color="warning" icon="warning">
  Review
</Badge>`,
  },
  {
    name: "Custom colors",
    description: "Use customColors for domain-owned palettes such as posting code categories.",
    preview: (
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        {CUSTOM_COLORS.map(({ label, colors }) => (
          <Badge key={label} variant="soft" size="medium" customColors={colors}>
            {label}
          </Badge>
        ))}
      </div>
    ),
    code: `const categoryColors = {
  fg: "#166534",
  bg: "#dcfce7",
  border: "#86efac",
};

<Badge variant="soft" size="medium" customColors={categoryColors}>
  REVENUE
</Badge>`,
  },
] satisfies { name: string; description: string; preview: React.ReactNode; code: string }[];

const PROPS = [
  { name: "variant", type: `"soft" | "solid" | "outline"`, required: "Yes", description: "Visual treatment for the badge." },
  { name: "size", type: `"x-small" | "small" | "medium" | "large" | "x-large"`, required: "Yes", description: "Badge scale. X-small is suitable for dense table rows." },
  { name: "color", type: `"info" | "success" | "warning" | "danger" | "neutral" | "plain"`, required: "Yes", description: "Semantic colour palette." },
  { name: "customColors", type: `{ fg: string; bg: string; border: string }`, required: "", description: "Overrides the semantic palette for domain-specific badges." },
  { name: "icon", type: "string", required: "", description: "Material Symbols icon name displayed before the label." },
  { name: "children", type: "React.ReactNode", required: "", description: "Badge label." },
  { name: "...rest", type: "HTMLAttributes<HTMLSpanElement>", required: "", description: "Native span attributes." },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Badge</h1>
        <p className={pageStyles.description}>
          Compact status and metadata label with controlled variant, size, and colour options.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ Badge }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Props</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {PROPS.map((p) => (
                <tr key={p.name}>
                  <td><code className={pageStyles.propName}>{p.name}</code></td>
                  <td><code className={pageStyles.propType}>{p.type}</code></td>
                  <td className={pageStyles.propRequired}>{p.required}</td>
                  <td>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {STORIES.map((story, i) => (
        <section key={story.name} className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>{story.name}</h2>
          <p style={{ fontSize: "0.875rem", color: "var(--voyzu-color-text-secondary)", marginBottom: "0.875rem", lineHeight: 1.6 }}>
            {story.description}
          </p>
          <div style={{ marginBottom: "1.25rem" }}>
            {story.preview}
          </div>
          <div className={pageStyles.story}>
            <div className={pageStyles.codeBlock} dangerouslySetInnerHTML={{ __html: codeHtmls[i]! }} />
          </div>
        </section>
      ))}
    </main>
  );
}
