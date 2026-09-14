"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { OrganizationFinance, OrganizationFinanceChanges } from "@voyzu/types/business-objects/organization-finance";
import type { OrganizationResponseDto } from "@voyzu/organization/types/modules/organizations";
import { Button, Input, SearchableSelect, Toast, ValidationAlert } from "@voyzu/ui-components";
import detail from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
].map((label, index) => ({ value: String(index + 1), label }));

const INTERVALS = [
  { value: "1", label: "Monthly" },
  { value: "2", label: "Every two months" },
  { value: "3", label: "Quarterly" },
  { value: "6", label: "Half-yearly" },
  { value: "12", label: "Annually" },
];

export function OrganizationFinanceTab({ organization, finance }: { organization: OrganizationResponseDto; finance: OrganizationFinance }) {
  const router = useRouter();
  const [anchorMonth, setAnchorMonth] = useState(String(finance.taxFilingAnchorMonth));
  const [interval, setInterval] = useState(String(finance.taxFilingIntervalMonths));
  const [reportLine1, setReportLine1] = useState(finance.reportLine1 ?? "");
  const [reportLine2, setReportLine2] = useState(finance.reportLine2 ?? "");
  const [reportFooter, setReportFooter] = useState(finance.reportFooter ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  const request = async (url: string, init: RequestInit): Promise<OrganizationFinance> => {
    const response = await fetch(url, init);
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(body?.message ?? "Unable to update financial entity");
    }
    return response.json() as Promise<OrganizationFinance>;
  };

  const apply = (updated: OrganizationFinance) => {
    setAnchorMonth(String(updated.taxFilingAnchorMonth));
    setInterval(String(updated.taxFilingIntervalMonths));
    setReportLine1(updated.reportLine1 ?? "");
    setReportLine2(updated.reportLine2 ?? "");
    setReportFooter(updated.reportFooter ?? "");
  };

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const payload: OrganizationFinanceChanges = {
        taxFilingAnchorMonth: Number(anchorMonth),
        taxFilingIntervalMonths: Number(interval) as 1 | 2 | 3 | 6 | 12,
        reportLine1: reportLine1 || undefined,
        reportLine2: reportLine2 || undefined,
        reportFooter: reportFooter || undefined,
      };
      apply(await request(`/api/organization/organizations/${encodeURIComponent(organization.code)}/finance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }));
      setToast(`Updated ${organization.code}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update financial entity");
    } finally {
      setBusy(false);
    }
  };

  const readOnly = busy || organization.status !== "ACTIVE";

  return (
    <>
      {error ? <ValidationAlert errors={[error]} visible onDismiss={() => setError("")} /> : null}
      <section className={detail.card}>
        <div className={detail.cardHeader}>
          <h2 className={`${typography.sectionHeading} ${detail.cardHeaderTitle}`}>Financial Entity</h2>
          <div className={detail.cardHeaderActions}>
            <Button variant="secondary" icon="save" disabled={readOnly} onClick={() => void save()}>Save</Button>
          </div>
        </div>
        <div className={detail.formGrid}>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Code</span><Input value={organization.code} disabled /></label>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Name</span><Input value={organization.name} disabled /></label>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Country</span><Input value={`${organization.country?.name ?? organization.countryCode} (${organization.countryCode})`} disabled /></label>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Base Currency</span><Input value={`${organization.baseCurrency?.name ?? organization.baseCurrencyCode} (${organization.baseCurrencyCode})`} disabled /></label>
        </div>
      </section>
      <section className={detail.card}>
        <h2 className={typography.sectionHeading}>Tax Filing - Tax on Sales</h2>
        <div className={detail.formGrid}>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Anchor Month</span><SearchableSelect value={anchorMonth} onChange={setAnchorMonth} options={MONTHS} searchable={false} codeBadge={false} disabled={readOnly} /></label>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Interval</span><SearchableSelect value={interval} onChange={setInterval} options={INTERVALS} searchable={false} codeBadge={false} disabled={readOnly} /></label>
        </div>
      </section>
      <section className={detail.card}>
        <h2 className={typography.sectionHeading}>Report Text</h2>
        <div className={detail.formGrid}>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Report Heading Line 1</span><Input maxLength={80} value={reportLine1} disabled={readOnly} onChange={(event) => setReportLine1(event.target.value)} /></label>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Report Heading Line 2</span><Input maxLength={80} value={reportLine2} disabled={readOnly} onChange={(event) => setReportLine2(event.target.value)} /></label>
          <label className={detail.fieldGroup}><span className={typography.fieldLabel}>Report Footer</span><Input maxLength={80} value={reportFooter} disabled={readOnly} onChange={(event) => setReportFooter(event.target.value)} /></label>
        </div>
      </section>
      <Toast isVisible={Boolean(toast)} onClose={() => setToast("")} message={toast} />
    </>
  );
}
