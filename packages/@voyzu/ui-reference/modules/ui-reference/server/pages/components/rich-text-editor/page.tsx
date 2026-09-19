import { getSingletonHighlighter } from "shiki";
import styles from "../../page.module.css";
import { RichTextEditorPreview } from "./rich-text-editor-preview";
const example = `"use client";
import { useState } from "react";
import { RichTextEditor, createEmptyRichTextDocument,
  parseRichTextDocument, type RichTextDocument } from "@voyzu/ui-components";

const [document, setDocument] = useState<RichTextDocument>(createEmptyRichTextDocument);
<RichTextEditor value={document} onChange={setDocument} />

// Save the complete JSON object in your owning module's storage.
// For text storage or an HTTP request body:
const serialized = JSON.stringify(document);
// await saveRecord({ content: document, contentSchemaVersion: 1 });

// Loading from JSON text; validate before replacing the editor value.
const restored = parseRichTextDocument(JSON.parse(serialized));
setDocument(restored);
// For a JSON/JSONB object, call parseRichTextDocument(record.content) directly.`;
export default async function Page() {
  const hl = await getSingletonHighlighter({ themes: ["github-light"], langs: ["tsx"] });
  const html = hl.codeToHtml(example, { lang: "tsx", theme: "github-light" });
  return <main className={styles.page}>
    <div className={styles.header}><p className={styles.eyebrow}>Components</p><h1 className={styles.title}>Rich Text Editor</h1><p className={styles.description}>ProseMirror editing with headings, lists, links, undo/redo and resizable tables. Export actions belong to the calling screen, outside the editor toolbar.</p><div className={styles.importBlock}><code>import {"{ RichTextEditor }"} from &quot;@voyzu/ui-components&quot;</code></div></div>
    <section className={styles.section}><h2 className={styles.sectionTitle}>Interactive example</h2><RichTextEditorPreview /></section>
    <section className={styles.section}><h2 className={styles.sectionTitle}>Props</h2><div className={styles.tableWrap}><table className={styles.propsTable}><thead><tr><th>Prop</th><th>Type</th><th>Description</th></tr></thead><tbody>
      <tr><td>value</td><td>RichTextDocument</td><td>Required native ProseMirror JSON document.</td></tr>
      <tr><td>onChange</td><td>(document) =&gt; void</td><td>Receives the whole JSON document after content changes. Store it in state and pass it back as value.</td></tr>
      <tr><td>readOnly</td><td>boolean</td><td>Prevents editing and hides the toolbar. Defaults to false.</td></tr>
      <tr><td>resizable</td><td>boolean</td><td>Enables the bottom-right handle for vertical resizing.</td></tr>
      <tr><td>invalid</td><td>boolean</td><td>Shows an error border and sets aria-invalid.</td></tr>
      <tr><td>ariaLabel</td><td>string</td><td>Accessible name, default: Rich text editor.</td></tr>
      <tr><td>className</td><td>string</td><td>Additional class on the editor container.</td></tr>
    </tbody></table></div></section>
    <section className={styles.section}><h2 className={styles.sectionTitle}>Load and save the native format</h2><p>The native format is the document JSON, not Markdown, HTML, EditorState or EditorView. Save the onChange value as a JSON object (for example JSONB), or serialize it with JSON.stringify for text storage. Store a schema version alongside it so future schema changes can be migrated.</p><p>Load with parseRichTextDocument, handling invalid JSON or unsupported nodes before assigning the value. Use createEmptyRichTextDocument for a new record. Replacing value with a different document resets undo history; passing onChange values back preserves the current selection and undo history. Native JSON saves content and formatting, not the cursor or undo history.</p><div className={styles.codeBlock} dangerouslySetInnerHTML={{ __html: html }} /></section>
    <section className={styles.section}><h2 className={styles.sectionTitle}>Export helpers</h2><p>richTextToMarkdown(document) and richTextToHtml(document) return strings. Call them from client-side actions, then copy, download or save the returned text in the calling screen. HTML is a fragment. Simple tables export as Markdown pipe tables; merged cells and complex table content use embedded HTML. Use native JSON for lossless editing round trips. These exports are not import formats for the control.</p></section>
  </main>;
}
