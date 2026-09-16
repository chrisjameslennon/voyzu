"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TextSelection, type EditorState } from "prosemirror-state";
import type { EditorView } from "prosemirror-view";
import { Button } from "../button/button";
import { Input } from "../input/input";
import { ValidationAlert } from "../validation-alert/validation-alert";
import detail from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import styles from "./rich-text-editor.module.css";

export function getLinkTarget(state: EditorState) {
  const { from, to, empty, $from } = state.selection;
  const linkType = state.schema.marks.link;
  const parent = $from.parent;
  const offset = $from.parentOffset;
  const child = parent.childAfter(offset);
  let mark = child.node && linkType.isInSet(child.node.marks);
  let index = child.index;
  let start = child.offset;

  // At the end of a link, use the character immediately before the cursor.
  if (!mark && empty && offset > 0) {
    const before = parent.childBefore(offset);
    mark = before.node && linkType.isInSet(before.node.marks);
    index = before.index;
    start = before.offset;
  }

  if (mark) {
    let end = start + parent.child(index).nodeSize;
    let left = index;
    let right = index + 1;
    while (left > 0 && mark.isInSet(parent.child(left - 1).marks)) {
      start -= parent.child(--left).nodeSize;
    }
    while (right < parent.childCount && mark.isInSet(parent.child(right).marks)) {
      end += parent.child(right++).nodeSize;
    }
    const base = $from.start();
    if (to <= base + end) {
      return { from: base + start, to: base + end, href: String(mark.attrs.href),
        title: String(mark.attrs.title ?? ""), existing: true };
    }
  }

  if (empty || !(state.selection instanceof TextSelection) ||
      !$from.parent.type.allowsMarkType(linkType)) return null;
  return { from, to, href: "", title: "", existing: false };
}

export type LinkRequest = NonNullable<ReturnType<typeof getLinkTarget>> & { view: EditorView };

export default function LinkDialog({ request, onClose }: {
  request: LinkRequest;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const id = useId();
  const [href, setHref] = useState(request.href);
  const [title, setTitle] = useState(request.title);
  const [error, setError] = useState("");

  useEffect(() => {
    const outside = (event: MouseEvent) => {
      if (dialog.current && !dialog.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  function close() {
    onClose();
    if (!request.view.isDestroyed) request.view.focus();
  }

  function apply(remove: boolean) {
    const url = href.trim();
    if (!remove) {
      try {
        const parsed = new URL(url, window.location.href);
        if (!url || !["http:", "https:", "mailto:", "tel:"].includes(parsed.protocol)) {
          throw new Error("Invalid link");
        }
      } catch {
        setError("Enter a valid web URL, relative path, email (mailto:), or phone (tel:) link.");
        return;
      }
    }
    const { view, from, to } = request;
    if (view.isDestroyed || !view.editable) { close(); return; }
    const link = view.state.schema.marks.link;
    const tr = view.state.tr.removeMark(from, to, link);
    if (!remove) tr.addMark(from, to, link.create({ href: url, title: title.trim() || null }));
    tr.removeStoredMark(link);
    view.dispatch(tr.scrollIntoView());
    close();
  }

  return <div role="dialog" className={styles.linkDialog} ref={dialog} aria-labelledby={id + "-heading"}
    onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(); } }}>
    <form onSubmit={(event) => { event.preventDefault(); apply(false); }}>
      <div className={styles.linkHeader}><h2 id={id + "-heading"} className={typography.sectionHeading}>{request.existing ? "Edit Link" : "Add Link"}</h2><Button variant="plain" type="button" icon="close" onClick={close} aria-label="Close link dialog" /></div>
      <div className={styles.linkBody}>
        <ValidationAlert errors={error ? [error] : []} visible={!!error} onDismiss={() => setError("")} />
        <div className={detail.fieldGroup}><label className={typography.fieldLabel} htmlFor={id + "-url"}>URL</label><Input id={id + "-url"} autoFocus value={href} placeholder="https://example.com" autoComplete="off" invalid={!!error} onChange={(event) => { setHref(event.target.value); setError(""); }} /></div>
        <div className={detail.fieldGroup}><label className={typography.fieldLabel} htmlFor={id + "-title"}>Title (optional)</label><Input id={id + "-title"} value={title} placeholder="Text shown when hovering over the link" onChange={(event) => setTitle(event.target.value)} /></div>
      </div>
      <div className={styles.linkFooter}>
        {request.existing && <Button variant="secondary-destructive" type="button" onClick={() => apply(true)}>Remove Link</Button>}
        <Button variant="cancel" type="button" onClick={close}>Cancel</Button><Button variant="primary" type="submit">{request.existing ? "Save" : "Add Link"}</Button>
      </div>
    </form>
  </div>;
}
