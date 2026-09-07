import { getSingletonHighlighter } from "shiki";
import localStyles from "../../page.module.css";
import { TextareaPreview } from "./textarea-previews";

const code = `import { Textarea } from "@voyzu/ui-components";

<label>
  Notes
  <Textarea
    value={notes}
    onChange={(event) => setNotes(event.target.value)}
    rows={4}
    invalid={hasError}
    aria-describedby="notes-help"
  />
</label>
<p id="notes-help">Additional information about this document.</p>`;

export default async function Page() {
  const highlighter = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  return <main className={localStyles.page}>
    <div className={localStyles.header}>
      <p className={localStyles.eyebrow}>Components</p>
      <h1 className={localStyles.title}>Textarea</h1>
      <p className={localStyles.description}>Multiline text using the shared input appearance. Supply a visible label and associate help or validation messages with aria-describedby.</p>
      <div className={localStyles.importBlock}><code>import {"{ Textarea }"} from &quot;@voyzu/ui-components&quot;</code></div>
    </div>
    <section className={localStyles.section}>
      <h2 className={localStyles.sectionTitle}>Props</h2>
      <div className={localStyles.tableWrap}><table className={localStyles.propsTable}>
        <thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>value / onChange</td><td>Native textarea props</td><td>Controlled input; defaultValue is also supported.</td></tr>
          <tr><td>rows</td><td>number</td><td>Initial height in text rows; defaults to 3. Resizes vertically.</td></tr>
          <tr><td>invalid</td><td>boolean</td><td>Error appearance and aria-invalid.</td></tr>
          <tr><td>disabled</td><td>boolean</td><td>Prevents editing, retaining focus, selection and copying, like Input.</td></tr>
          <tr><td>readOnly</td><td>boolean</td><td>Native read-only behaviour without disabled presentation.</td></tr>
          <tr><td>…rest</td><td>TextareaHTMLAttributes</td><td>Native attributes, including id, name, required, maxLength and accessibility attributes.</td></tr>
        </tbody>
      </table></div>
    </section>
    <section className={localStyles.section}><h2 className={localStyles.sectionTitle}>States and sizing</h2><TextareaPreview /></section>
    <section className={localStyles.section}><h2 className={localStyles.sectionTitle}>Usage</h2>
      <div className={localStyles.codeBlock} dangerouslySetInnerHTML={{ __html: highlighter.codeToHtml(code, { lang: "tsx", theme: "github-light" }) }} />
    </section>
  </main>;
}
