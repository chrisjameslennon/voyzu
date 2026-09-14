"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Badge, Breadcrumbs, Button, ConfirmDialog, Input } from "@voyzu/ui-components";
import { DetailBackButton } from "@voyzu/ui-surface/client";
import { PartiesAuditPanel, getStatusSemanticColor } from "@voyzu/party/common/client";
import type { PartyResponseDto } from "@voyzu/party/types/modules/parties";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

export function PartyDetail({ party }: { party?: PartyResponseDto }) {
  const router = useRouter();
  const [current, setCurrent] = useState(party);
  const [code, setCode] = useState(party?.code ?? "");
  const [name, setName] = useState(party?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function mutate(action: "save" | "activate" | "deactivate" | "delete") {
    if (busy) return;
    setBusy(true); setError(""); setConfirmDelete(false);
    try {
      const base = current ? `/api/parties/${encodeURIComponent(current.code)}` : "/api/parties";
      const response = await fetch(action === "activate" || action === "deactivate" ? `${base}/${action}` : base, {
        method: action === "delete" ? "DELETE" : action === "save" && current ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        ...(action === "save" ? { body: JSON.stringify(current ? { name: name.trim() } : { code: code.trim().toUpperCase(), name: name.trim() }) } : {}),
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message ?? body.error?.message ?? "Unable to save party");
      }
      if (action === "delete") { router.push("/settings/parties"); router.refresh(); return; }
      const saved = await response.json() as PartyResponseDto;
      setCurrent(saved); setName(saved.name); setCode(saved.code);
      if (!current) router.replace(`/settings/parties/${encodeURIComponent(saved.code)}`);
      router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save party"); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void mutate("save"); }

  return (
    <div className={`${layoutStyles.detailView} ${layoutStyles.detailViewWithStatusRail}`}>
      <header className={layoutStyles.detailHeader}>
        <div className={layoutStyles.slotBreadcrumb}><Breadcrumbs /></div>
        <div className={layoutStyles.slotTitle}>
          <div className={detailStyles.title}>
            <div className={detailStyles.titleIcon}><span className={`material-symbols-outlined ${detailStyles.titleIconSymbol}`}>groups</span></div>
            <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>{current?.name ?? "New Party"}</h1>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <DetailBackButton fallbackHref="/settings/parties" />
            <Button variant="secondary" icon="save" type="submit" form="party-form" disabled={busy || !code.trim() || !name.trim()}>Save</Button>
          </div>
        </div>
      </header>
      <aside className={layoutStyles.statusSection}>
        <div className={detailStyles.card}>
          <div className={detailStyles.fieldGroup}>
            <span className={typography.fieldLabel}>Status</span>
            <Badge variant="soft" size="x-large" color={getStatusSemanticColor(current?.status ?? "ACTIVE")}>{current?.status ?? "ACTIVE"}</Badge>
          </div>
        </div>
        {current && <>
          <div className={detailStyles.card}>
            <div className={detailStyles.headerActions}>
              <Button variant="secondary" icon={current.status === "ACTIVE" ? "block" : "check_circle"} disabled={busy} onClick={() => void mutate(current.status === "ACTIVE" ? "deactivate" : "activate")}>{current.status === "ACTIVE" ? "Deactivate" : "Activate"}</Button>
              <Button variant="secondary-destructive" icon="delete" title="Delete party" disabled={busy} onClick={() => setConfirmDelete(true)} />
            </div>
          </div>
          <PartiesAuditPanel id={current.id} creationDate={current.audit.created.date} updatedDate={current.audit.updated.date}
            creationActorType={current.audit.created.actorType} creationUser={current.audit.created.user}
            updatedActorType={current.audit.updated.actorType} updatedUser={current.audit.updated.user}
            auditHref={`/settings/audit?entityType=party&entityCode=${encodeURIComponent(current.code)}`}
            mutationId={current.audit.updated.mutationId ?? current.audit.created.mutationId} />
        </>}
      </aside>
      <main className={layoutStyles.mainSection}>
        <form id="party-form" onSubmit={submit} className={detailStyles.card}>
          <h2 className={typography.sectionHeading}>Party Details</h2>
          {error && <p role="alert">{error}</p>}
          <div className={detailStyles.fieldGroup}>
            <label htmlFor="party-code" className={typography.fieldLabel}>Code</label>
            <Input id="party-code" value={code} required disabled={!!current} pattern="[A-Z0-9][A-Z0-9_-]*" onChange={event => setCode(event.target.value.toUpperCase())} />
          </div>
          <div className={detailStyles.fieldGroup}>
            <label htmlFor="party-name" className={typography.fieldLabel}>Name</label>
            <Input id="party-name" value={name} required onChange={event => setName(event.target.value)} />
          </div>
        </form>
      </main>
      <ConfirmDialog isOpen={confirmDelete} title="Delete party" message={`Delete ${current?.name ?? "this party"}?`} confirmLabel="Delete" onClose={() => setConfirmDelete(false)} onConfirm={() => void mutate("delete")} />
    </div>
  );
}
