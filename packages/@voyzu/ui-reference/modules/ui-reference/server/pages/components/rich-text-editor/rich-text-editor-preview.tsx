"use client";
import { useState } from "react";
import { Button, RichTextEditor, Textarea, ValidationAlert, parseRichTextDocument, richTextToMarkdown, richTextToHtml, type RichTextDocument } from "@voyzu/ui-components";
const initial: RichTextDocument = { type: "doc", content: [
  { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Try the rich text editor" }] },
  { type: "paragraph", content: [{ type: "text", text: "Select text to format it, add a link, or insert a table using the toolbar." }] },
] };
export function RichTextEditorPreview() {
  const [value, setValue] = useState<RichTextDocument>(initial);
  const [json, setJson] = useState(JSON.stringify(initial, null, 2));
  const [exported, setExported] = useState<{ format: string; text: string } | null>(null);
  const [error, setError] = useState("");
  function load() {
    try { setValue(parseRichTextDocument(JSON.parse(json))); setError(""); }
    catch { setError("Supply valid native JSON using this editor's document schema."); }
  }
  return <div style={{ display: "grid", gap: "1rem" }}>
    <RichTextEditor value={value} onChange={setValue} ariaLabel="Rich text editor demo" />
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      <Button variant="secondary" icon="file_download" onClick={() => setExported({ format: "Markdown", text: richTextToMarkdown(value) })}>Export to Markdown</Button>
      <Button variant="secondary" icon="code" onClick={() => setExported({ format: "HTML", text: richTextToHtml(value) })}>Export to HTML</Button>
    </div>
    {exported && <label>Exported {exported.format}<Textarea aria-label={"Exported " + exported.format} readOnly rows={10} spellCheck={false} value={exported.text} /></label>}
    <p>Native JSON preserves the full document, including table structure and formatting. Copy it to save a snapshot, or edit and reload it below. This example does not write to a database.</p>
    <ValidationAlert errors={error ? [error] : []} visible={!!error} onDismiss={() => setError("")} />
    <label>Native document JSON<Textarea aria-label="Native document JSON" invalid={!!error} rows={10} spellCheck={false} value={json} onChange={(event) => setJson(event.target.value)} /></label>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}><Button variant="secondary" icon="save" onClick={() => { setJson(JSON.stringify(value, null, 2)); setError(""); }}>Copy editor to JSON</Button><Button variant="secondary" icon="upload" onClick={load}>Load JSON into editor</Button></div>
  </div>;
}
