"use client";

import { useEffect, useRef, useState } from "react";



import { EditorState, type Command } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { buildMenuItems, exampleSetup } from "prosemirror-example-setup";
import { Dropdown, DropdownSubmenu, MenuItem, icons, selectParentNodeItem } from "prosemirror-menu";
import { keymap } from "prosemirror-keymap";
import {
  tableEditing, columnResizing, goToNextCell,
  addRowBefore, addRowAfter, deleteRow, addColumnBefore, addColumnAfter,
  deleteColumn, deleteTable, mergeCells, splitCell, toggleHeaderRow,
} from "prosemirror-tables";
import { richTextSchema as schema, readRichTextDocument, type RichTextDocument } from "./document";
import styles from "./rich-text-editor.module.css";
import "prosemirror-view/style/prosemirror.css";
import "prosemirror-menu/style/menu.css";
import "prosemirror-example-setup/style/style.css";
import "prosemirror-tables/style/tables.css";
import LinkDialog, { getLinkTarget, type LinkRequest } from "./link-dialog";

const insertTable: Command = (state, dispatch) => {
  // Keep tables at block boundaries and avoid inserting nested tables.
  for (let depth = state.selection.$from.depth; depth > 0; depth--) {
    if (state.selection.$from.node(depth).type.spec.tableRole) return false;
  }
  if (dispatch) {
    const rows = Array.from({ length: 3 }, (_, row) =>
      schema.nodes.table_row.create(null, Array.from({ length: 3 }, () =>
        (row === 0 ? schema.nodes.table_header : schema.nodes.table_cell)
          .createAndFill()!,
      )),
    );
    const tr = state.tr.replaceSelectionWith(schema.nodes.table.create(null, rows));
    dispatch(tr.scrollIntoView());
  }
  return true;
};

function tableItem(label: string, command: Command) {
  return new MenuItem({ label, enable: (state) => command(state), run: command });
}

const tableMenu = new Dropdown([
  tableItem("Insert table (3 × 3)", insertTable),
  tableItem("Add row above", addRowBefore),
  tableItem("Add row below", addRowAfter),
  tableItem("Delete row", deleteRow),
  tableItem("Add column before", addColumnBefore),
  tableItem("Add column after", addColumnAfter),
  tableItem("Delete column", deleteColumn),
  tableItem("Toggle header row", toggleHeaderRow),
  tableItem("Merge cells", mergeCells),
  tableItem("Split cell", splitCell),
  tableItem("Delete table", deleteTable),
], { label: "Table" });

export interface RichTextEditorProps {
  value: RichTextDocument;
  onChange?: (value: RichTextDocument) => void;
  ariaLabel?: string;
  readOnly?: boolean;
  invalid?: boolean;
  resizable?: boolean;
  className?: string;
}
export function RichTextEditor({ value, onChange, ariaLabel = "Rich text editor", readOnly = false, invalid = false, resizable = false, className }: RichTextEditorProps) {
  const container = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView | null>(null);
  const props = useRef({ value, onChange, ariaLabel, readOnly, invalid });
  props.current = { value, onChange, ariaLabel, readOnly, invalid };
  const [linkRequest, setLinkRequest] = useState<LinkRequest | null>(null);

  useEffect(() => {
    if (!container.current) return;

    const menu = buildMenuItems(schema);
    const linkItem = new MenuItem({
      title: "Add or edit link",
      icon: icons.link,
      enable: (state) => getLinkTarget(state) !== null,
      active: (state) => getLinkTarget(state)?.existing ?? false,
      run(state, _dispatch, view) {
        const target = getLinkTarget(state);
        if (target) setLinkRequest({ ...target, view });
      },
    });
    const formatMenu = new Dropdown([
      ...[menu.makeParagraph, menu.makeCodeBlock].filter((item): item is MenuItem => !!item),
      new DropdownSubmenu([
        menu.makeHead1, menu.makeHead2, menu.makeHead3,
        menu.makeHead4, menu.makeHead5, menu.makeHead6,
      ].filter((item): item is MenuItem => !!item), { label: "Heading" }),
    ], { label: "Format" });
    if (menu.insertHorizontalRule) {
      menu.insertHorizontalRule.spec.icon = {
        width: 24, height: 24,
        path: "M3 11h18v2H3z",
      };
    }
    const menuContent = [
      [formatMenu],
      ...menu.fullMenu.map((group) =>
        group.flatMap((item) => {
          if (item === menu.typeMenu || item === menu.insertMenu || item === selectParentNodeItem) return [];
          if (item === menu.toggleLink) return [linkItem, ...[menu.insertHorizontalRule].filter((button): button is MenuItem => !!button)];
          return [item === menu.toggleLink ? linkItem : item];
        }),
      ).filter((group) => group.length > 0),
    ];
    menuContent.push([tableMenu]);

    const view = new EditorView(container.current, {
      state: EditorState.create({
        doc: readRichTextDocument(props.current.value),
        plugins: [
          columnResizing(),
          keymap({ Tab: goToNextCell(1), "Shift-Tab": goToNextCell(-1) }),
          ...exampleSetup({ schema, floatingMenu: false, menuContent }),
          tableEditing(),
        ],
      }),
      editable: () => !props.current.readOnly,
      dispatchTransaction(transaction) {
        if (props.current.readOnly && transaction.docChanged) return;
        const next = view.state.applyTransaction(transaction).state;
        const changed = !next.doc.eq(view.state.doc);
        view.updateState(next);
        if (changed) props.current.onChange?.(next.doc.toJSON() as RichTextDocument);
      },
      attributes: {
        role: "textbox",
        "aria-label": props.current.ariaLabel,
        "aria-readonly": String(props.current.readOnly),
        "aria-invalid": props.current.invalid ? "true" : "false",
        "aria-multiline": "true",
      },
    });

    editorView.current = view;
    return () => {
      editorView.current = null;
      view.destroy();
    };
  }, []);

  useEffect(() => {
    const view = editorView.current;
    if (!view) return;
    const doc = readRichTextDocument(value);
    if (!doc.eq(view.state.doc)) {
      setLinkRequest(null);
      // External replacement starts a new editing history; controlled echoes preserve it.
      view.updateState(EditorState.create({ doc, plugins: view.state.plugins }));
    }
  }, [value]);
  useEffect(() => {
    editorView.current?.setProps({ editable: () => !readOnly, attributes: { role: "textbox", "aria-label": ariaLabel, "aria-multiline": "true", "aria-readonly": String(readOnly), "aria-invalid": String(invalid) } });
    if (readOnly) setLinkRequest(null);
  }, [readOnly, ariaLabel, invalid]);
  return <div className={styles.wrapper + (resizable ? " " + styles.resizable : "") + (linkRequest ? " " + styles.linkOpen : "")}>
    <div ref={container} className={[styles.editor, readOnly ? styles.readOnly : "", invalid ? styles.invalid : "", className].filter(Boolean).join(" ")} />
    {linkRequest && <LinkDialog request={linkRequest} onClose={() => setLinkRequest(null)} />}
  </div>;
}
