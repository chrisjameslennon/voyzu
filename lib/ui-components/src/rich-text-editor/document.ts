import { Schema, DOMSerializer, type Node as ProseMirrorNode } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { tableNodes } from "prosemirror-tables";
import { markdownSerializer } from "./markdown";
export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}
export interface RichTextDocument extends RichTextNode { type: "doc"; }
export function isSafeRichTextUrl(url: string, image = false): boolean {
  try { return !!url.trim() && (image ? ["http:", "https:"] : ["http:", "https:", "mailto:", "tel:"]).includes(new URL(url, "https://example.invalid").protocol); } catch { return false; }
}
const link = basicSchema.spec.marks.get("link")!;
const image = basicSchema.spec.nodes.get("image")!;
export const richTextSchema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes.update("image", {
    ...image,
    parseDOM: [{ tag: "img[src]", getAttrs: (dom) => { const src = dom.getAttribute("src") ?? ""; return isSafeRichTextUrl(src, true) ? { src, title: dom.getAttribute("title"), alt: dom.getAttribute("alt") } : false; } }],
  }), "paragraph block*", "block").append(tableNodes({ tableGroup: "block", cellContent: "block+", cellAttributes: {} })),
  marks: basicSchema.spec.marks.update("link", {
    ...link,
    parseDOM: [{ tag: "a[href]", getAttrs: (dom) => { const href = dom.getAttribute("href") ?? ""; return isSafeRichTextUrl(href) ? { href, title: dom.getAttribute("title") } : false; } }],
  }),
});
export function createEmptyRichTextDocument(): RichTextDocument { return { type: "doc", content: [{ type: "paragraph" }] }; }
export function readRichTextDocument(value: unknown): ProseMirrorNode {
  const node = richTextSchema.nodeFromJSON(value);
  if (node.type !== richTextSchema.topNodeType) throw new Error("Expected a rich-text document.");
  node.check();
  node.descendants((child) => {
    if (child.type.name === "image" && !isSafeRichTextUrl(String(child.attrs.src), true)) throw new Error("Unsupported image URL.");
    for (const mark of child.marks) if (mark.type.name === "link" && !isSafeRichTextUrl(String(mark.attrs.href))) throw new Error("Unsupported link URL.");
  });
  return node;
}
/** Validate and normalize parsed JSON before assigning it to the editor. */
export function parseRichTextDocument(value: unknown): RichTextDocument { return readRichTextDocument(value).toJSON() as RichTextDocument; }
/** Browser-only: complex tables are serialized as HTML within Markdown. */
export function richTextToMarkdown(value: RichTextDocument): string { return markdownSerializer.serialize(readRichTextDocument(value)); }
/** Browser-only: returns an HTML fragment, not a complete HTML page. */
export function richTextToHtml(value: RichTextDocument): string {
  const element = document.createElement("div");
  element.appendChild(DOMSerializer.fromSchema(richTextSchema).serializeFragment(readRichTextDocument(value).content));
  return element.innerHTML;
}
