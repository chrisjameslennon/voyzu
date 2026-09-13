"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { OrganizationAuditPanel as AuditPanel, getStatusSemanticColor } from "@voyzu/organization/common/client";
import type { OrganizationResponseDto, OrganizationUpdateRequestDto } from "@voyzu/organization/types/modules/organizations";
import { Badge, Breadcrumbs, Button, Input, SearchableSelect, TabGroup } from "@voyzu/ui-components";
import { DetailBackButton } from "@voyzu/ui-surface/client";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

type SelectOption = { value: string; label: string; code?: string };

interface OrganizationDetailProps {
  organization: OrganizationResponseDto;
  activeCountries: SelectOption[];
  activeCurrencies: SelectOption[];
  extensionTabs?: Array<{ key: string; label: string; content: ReactNode }>;
  organizationOrganizationsHelpUrl?: string;
}

export function OrganizationDetail({ organization, activeCountries, activeCurrencies, extensionTabs = [] }: OrganizationDetailProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(organization);
  const [code, setCode] = useState(organization.code);
  const [name, setName] = useState(organization.name);
  const [countryCode, setCountryCode] = useState(organization.countryCode);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState(organization.baseCurrencyCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const payload: OrganizationUpdateRequestDto = { code, name, countryCode, baseCurrencyCode };
      const response = await fetch(`/api/organization/organizations/${encodeURIComponent(current.code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setError(body?.message ?? "Unable to update organization");
        return;
      }
      const updated = await response.json() as OrganizationResponseDto;
      setCurrent(updated);
      if (updated.code !== current.code) router.replace(`/organization/organizations/${encodeURIComponent(updated.code)}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async () => {
    setBusy(true);
    setError("");
    try {
      const operation = current.status === "ACTIVE" ? "deactivate" : "activate";
      const response = await fetch(`/api/organization/organizations/${encodeURIComponent(current.code)}/${operation}`, { method: "POST" });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setError(body?.message ?? "Unable to change organization status");
        return;
      }
      setCurrent(await response.json() as OrganizationResponseDto);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`${layoutStyles.detailView} ${layoutStyles.detailViewWithStatusRail}`}>
      <header className={layoutStyles.detailHeader}>
        <div className={layoutStyles.slotBreadcrumb}><Breadcrumbs /></div>
        <div className={layoutStyles.slotTitle}>
          <div className={detailStyles.title}>
            <div className={detailStyles.titleIcon}><span className="material-symbols-outlined">domain</span></div>
            <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>{current.name}</h1>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <DetailBackButton fallbackHref="/organization/organizations" />
            <Button onClick={() => void changeStatus()} disabled={busy} variant="secondary">
              {current.status === "ACTIVE" ? "Archive" : "Restore"}
            </Button>
          </div>
        </div>
      </header>

      <aside className={layoutStyles.statusSection}>
        <div className={detailStyles.card}>
          <div className={detailStyles.fieldGroup}>
            <span className={typography.fieldLabel}>Status</span>
            <Badge variant="soft" size="x-large" color={getStatusSemanticColor(current.status)}>{current.status}</Badge>
          </div>
        </div>
        <AuditPanel
          id={current.id}
          creationDate={current.audit.created.date}
          updatedDate={current.audit.updated.date}
          creationActorType={current.audit.created.actorType}
          creationUser={current.audit.created.user}
          updatedActorType={current.audit.updated.actorType}
          updatedUser={current.audit.updated.user}
          auditHref={`/settings/audit?entityType=organization&entityCode=${encodeURIComponent(current.code)}`}
          mutationId={current.audit.updated.mutationId ?? current.audit.created.mutationId}
        />
      </aside>

      <main className={layoutStyles.mainSection}>
        <TabGroup defaultKey="details" tabs={[
          {
            key: "details",
            label: "Details",
            content: (
              <section className={detailStyles.card}>
                <h2 className={typography.sectionHeading}>Organization Details</h2>
                {error ? <p>{error}</p> : null}
                <div className={detailStyles.formGrid}>
                  <label className={detailStyles.fieldGroup}><span className={typography.fieldLabel}>Code</span><Input value={code} maxLength={14} onChange={(event) => setCode(event.target.value.toUpperCase())} /></label>
                  <label className={detailStyles.fieldGroup}><span className={typography.fieldLabel}>Name</span><Input value={name} onChange={(event) => setName(event.target.value)} /></label>
                  <label className={detailStyles.fieldGroup}><span className={typography.fieldLabel}>Country</span><SearchableSelect value={countryCode} onChange={setCountryCode} options={activeCountries} /></label>
                  <label className={detailStyles.fieldGroup}><span className={typography.fieldLabel}>Base Currency</span><SearchableSelect value={baseCurrencyCode} onChange={setBaseCurrencyCode} options={activeCurrencies} /></label>
                </div>
                <div className={detailStyles.cardActions}><Button variant="primary" onClick={() => void save()} disabled={busy || !code || !name || !countryCode || !baseCurrencyCode}>Save</Button></div>
              </section>
            ),
          },
          ...extensionTabs,
        ]} />
      </main>
    </div>
  );
}
