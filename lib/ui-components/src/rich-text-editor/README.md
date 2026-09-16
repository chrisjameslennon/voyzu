# RichTextEditor

Controlled ProseMirror React editor, ported from rte-demo. Includes heading/format menus, inline marks, links, lists, horizontal rules, undo/redo, and tables with row/column operations, merged cells, resizing and Tab navigation. Export buttons are owned by the calling screen.

Import RichTextEditor, createEmptyRichTextDocument, parseRichTextDocument, richTextToMarkdown, richTextToHtml and RichTextDocument from @voyzu/ui-components.

## Native storage

Initialize React state with createEmptyRichTextDocument(). Pass state as value and its setter as onChange. Save the complete onChange JSON value in your module's data record. JSON/JSONB fields can store the object directly; text fields use JSON.stringify(value). Keep a contentSchemaVersion alongside stored content (start with 1).

Load JSON text with parseRichTextDocument(JSON.parse(savedText)); for JSON objects use parseRichTextDocument(savedObject). Catch validation errors before updating state. The validator checks the document root, nodes, marks, content and supported link/image URLs. New records use an empty paragraph. Never persist EditorState or EditorView. A new external document resets undo history; ordinary controlled echoes retain selection and history. Selection and undo history are not part of the saved document.

## Props

- value: required RichTextDocument.
- onChange: whole-document callback for editable controls.
- ariaLabel: accessible name (defaults to Rich text editor).
- readOnly: disables editing and hides toolbar.
- invalid: error border and aria-invalid.
- className: additional container styling.

## Exports

Browser-side richTextToMarkdown(value) returns Markdown; simple tables use pipe syntax and complex/merged tables use embedded HTML. richTextToHtml(value) returns an HTML fragment. Native JSON is the lossless editing format. Export helpers do not save data or create download buttons. The reference page provides separate export buttons and a JSON load/save demonstration at /ui-reference/components/rich-text-editor.
