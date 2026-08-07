import { getSingletonHighlighter } from "shiki";
import pageStyles from "../../page.module.css";
import {
  BadgeInputPreview,
  BasicInputPreview,
  DisabledInputPreview,
  InvalidInputPreview,
  PasswordInputPreview,
  RightSearchIconInputPreview,
  SearchIconInputPreview,
} from "./input-previews";

async function highlight(code: string) {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return hl.codeToHtml(code, { lang: "tsx", theme: "github-light" });
}

const STORIES = [
  {
    name: "Basic",
    description: "A standard text field using the shared control sizing, border, focus, and disabled states.",
    preview: <BasicInputPreview />,
    code: `const [value, setValue] = useState("");

<Input
  value={value}
  onChange={(event) => setValue(event.target.value)}
  placeholder="Display name"
/>`,
  },
  {
    name: "Search",
    description: "Set search to show a Material Symbols search icon inside the field.",
    preview: <SearchIconInputPreview />,
    code: `const [value, setValue] = useState("");

<Input
  search
  value={value}
  onChange={(event) => setValue(event.target.value)}
  placeholder="Search companies..."
/>`,
  },
  {
    name: "Right Icon",
    description: "Use position to move the decorative icon to the right side of the input.",
    preview: <RightSearchIconInputPreview />,
    code: `<Input
  search
  position="right"
  value={value}
  onChange={(event) => setValue(event.target.value)}
  placeholder="Search users..."
/>`,
  },
  {
    name: "Password",
    description: "Set password to render a visibility toggle and switch the field between password and text display.",
    preview: <PasswordInputPreview />,
    code: `<Input
  password
  value={value}
  onChange={(event) => setValue(event.target.value)}
  placeholder="Password"
/>`,
  },
  {
    name: "Invalid",
    description: "Set invalid when validation fails. The component applies its error appearance and sets aria-invalid on the native input.",
    preview: <InvalidInputPreview />,
    code: `<Input
  invalid={validation.hasError("name")}
  value={name}
  onChange={(event) => setName(event.target.value)}
  placeholder="Company name"
/>`,
  },
  {
    name: "Disabled",
    description: "Use disabled when input is unavailable for editing. Its value remains focusable, selectable, and copyable.",
    preview: <DisabledInputPreview />,
    code: `<Input
  value="Acme New Zealand Ltd"
  disabled
/>`,
  },
  {
    name: "Badge",
    description: "Use badge to show a trailing status or code badge without replacing the input value.",
    preview: <BadgeInputPreview />,
    code: `<Input
  value="Accounts Receivable"
  badge={<Badge variant="soft" size="x-small" color="info">AR</Badge>}
  disabled
/>`,
  },
];

const PROP_TABLE = [
  { name: "value", type: "string", required: "", description: "Current input value" },
  { name: "onChange", type: "ChangeEventHandler<HTMLInputElement>", required: "", description: "Called when the input changes" },
  { name: "placeholder", type: "string", required: "", description: "Placeholder text" },
  { name: "type", type: "HTMLInputTypeAttribute", required: "", description: "Native input type. Defaults to text; password mode overrides it" },
  { name: "invalid", type: "boolean", required: "", description: "Applies the validation error state and sets aria-invalid" },
  { name: "disabled", type: "boolean", required: "", description: "Prevents editing while keeping the value focusable, selectable, and copyable" },
  { name: "badge", type: "ReactNode", required: "", description: "Displays a trailing badge inside the input" },
  { name: "password", type: "boolean", required: "", description: "Adds a password visibility toggle and uses password text masking by default" },
  { name: "search", type: "boolean", required: "", description: "Adds a decorative search icon inside the input" },
  { name: "position", type: '"left" | "right"', required: "", description: "Controls the search icon position. Defaults to left" },
  { name: "containerClassName", type: "string", required: "", description: "Class applied to the outer wrapper" },
  { name: "className", type: "string", required: "", description: "Class applied to the input element" },
  { name: "...rest", type: "InputHTMLAttributes<HTMLInputElement>", required: "", description: "Native input props except readOnly" },
];

export default async function Page() {
  const codeHtmls = await Promise.all(STORIES.map((s) => highlight(s.code)));

  return (
    <main className={pageStyles.page}>
      <div className={pageStyles.header}>
        <p className={pageStyles.eyebrow}>Components</p>
        <h1 className={pageStyles.title}>Input</h1>
        <p className={pageStyles.description}>
          A general text input for standard fields, search fields, and password entry. Use this as the base input control for new UI.
        </p>
        <div className={pageStyles.importBlock}>
          <code>import {"{ Input }"} from &quot;@voyzu/ui-components&quot;</code>
        </div>
      </div>

      <section className={pageStyles.section}>
        <h2 className={pageStyles.sectionTitle}>Props</h2>
        <div className={pageStyles.tableWrap}>
          <table className={pageStyles.propsTable}>
            <thead>
              <tr><th>Prop</th><th>Type</th><th>Required</th><th>Description</th></tr>
            </thead>
            <tbody>
              {PROP_TABLE.map((p) => (
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
