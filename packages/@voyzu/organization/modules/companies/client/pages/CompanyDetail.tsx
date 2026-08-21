"use client";

import { OrganizationAuditPanel as AuditPanel } from "@voyzu/organization/common/client";

import { DetailBackButton } from "@voyzu/ui-surface/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { getHasPostingsColor, getStatusSemanticColor } from "@voyzu/organization/common/client";
import { ChangeCode, ChangeCodeAvailability } from "@voyzu/organization/companies/domain/operation-policy";
import type { CompanyResponseDto, CompanyUpdateRequestDto } from "@voyzu/organization/types/modules/companies";
import type { CompanySelectionUpdateRequestDto } from "@voyzu/organization/company-switcher/types";
import {
    Badge,
    Breadcrumbs,
    Button,
    ConfirmDialog,
    Input,
    maxLength, pattern, required,
    SearchableSelect,
    TabGroup,
    Toast,
    useFormValidation,
    ValidationAlert,
} from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";
import localStyles from "./CompanyDetail.module.css";

type SelectOption = { value: string; label: string; code?: string };

interface CompanyDetailProps {
  company: CompanyResponseDto;
  activeCountries: SelectOption[];
  activeCurrencies: SelectOption[];
  organizationCompaniesHelpUrl?: string;
}

const TAX_FILING_MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const TAX_FILING_INTERVAL_OPTIONS = [
  { value: "1", label: "Monthly" },
  { value: "2", label: "Every 2 months" },
  { value: "3", label: "Quarterly" },
  { value: "6", label: "Half yearly" },
  { value: "12", label: "Annually" },
];

const CODE_PATTERN = /^[A-Z0-9_-]*$/;

export function CompanyDetail({ company, activeCountries, activeCurrencies, organizationCompaniesHelpUrl }: CompanyDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentCompany, setCurrentCompany] = useState(company);
  const [code, setCode] = useState(company.code);
  const [name, setName] = useState(company.name);
  const [countryCode, setCountryCode] = useState(company.countryCode);
  const [currencyCode, setCurrencyCode] = useState(company.baseCurrencyCode);
  const [taxFilingAnchorMonth, setTaxFilingAnchorMonth] = useState(String(company.taxFilingAnchorMonth));
  const [taxFilingIntervalMonths, setTaxFilingIntervalMonths] = useState(String(company.taxFilingIntervalMonths));
  const [reportLine1, setReportLine1] = useState(company.reportLine1 ?? "");
  const [reportLine2, setReportLine2] = useState(company.reportLine2 ?? "");
  const [reportFooter, setReportFooter] = useState(company.reportFooter ?? "");
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [accessingArchivedCompany, setAccessingArchivedCompany] = useState(false);
  const [changingStandardSettings, setChangingStandardSettings] = useState(false);
  const [lifecycleAction, setLifecycleAction] = useState<"archive" | "restore" | "delete" | null>(null);
  const [isCodeChangeOpen, setIsCodeChangeOpen] = useState(false);
  const [isStandardSettingsChangeOpen, setIsStandardSettingsChangeOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const codeBlockers = ChangeCode(currentCompany, code);
  const codeChangeAvailabilityBlockers = ChangeCodeAvailability(currentCompany);

  const validation = useFormValidation(() => ({
    code: {
      label: "code",
      value: code,
      rules: [
        required(),
        pattern(CODE_PATTERN, "Code can only contain capital letters, numbers, dashes and underscores"),
        maxLength(14, "Code must be 14 characters or less"),
      ],
    },
    name: { label: "name", value: name, rules: [required()] },
    country: { label: "country", value: countryCode, rules: [required()] },
    currency: { label: "currency", value: currencyCode, rules: [required()] },
  }));

  useEffect(() => {
    const message = searchParams.get("toast");
    if (!message) return;
    setToastMessage(message);
    setToastVisible(true);
    router.replace(`/organization/companies/${encodeURIComponent(company.code)}`);
  }, [company.code, router, searchParams]);

  const currentErrors = [...validation.errors, ...(serverError ? [serverError] : [])];

  const applyUpdatedCompany = (updated: CompanyResponseDto) => {
    setCurrentCompany(updated);
    setCode(updated.code);
    setName(updated.name);
    setCountryCode(updated.countryCode);
    setCurrencyCode(updated.baseCurrencyCode);
    setTaxFilingAnchorMonth(String(updated.taxFilingAnchorMonth));
    setTaxFilingIntervalMonths(String(updated.taxFilingIntervalMonths));
    setReportLine1(updated.reportLine1 ?? "");
    setReportLine2(updated.reportLine2 ?? "");
    setReportFooter(updated.reportFooter ?? "");
  };

  const executeSave = async () => {
    setIsCodeChangeOpen(false);
    setSaving(true);
    setServerError("");
    try {
      const payload: CompanyUpdateRequestDto = {
        code,
        name,
        countryCode,
        baseCurrencyCode: currencyCode,
        taxFilingAnchorMonth: Number(taxFilingAnchorMonth),
        taxFilingIntervalMonths: Number(taxFilingIntervalMonths) as 1 | 2 | 3 | 6 | 12,
        useOrganizationStandardSettings: currentCompany.useOrganizationStandardSettings,
        reportLine1: reportLine1 || undefined,
        reportLine2: reportLine2 || undefined,
        reportFooter: reportFooter || undefined,
      };

      const response = await fetch(`/api/organization/companies/${encodeURIComponent(currentCompany.code)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
        setServerError(body?.message ?? "An unexpected error occurred");
        return;
      }
      const updated = await response.json() as CompanyResponseDto;
      applyUpdatedCompany(updated);
      validation.dismiss();
      setToastMessage(`Updated ${updated.code}`);
      setToastVisible(true);
      if (updated.code !== currentCompany.code) {
        router.replace(`/organization/companies/${encodeURIComponent(updated.code)}`);
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmStandardSettingsChange = async () => {
    setIsStandardSettingsChangeOpen(false);
    setChangingStandardSettings(true);
    setServerError("");
    try {
      const response = await fetch(`/api/organization/companies/${encodeURIComponent(currentCompany.code)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useOrganizationStandardSettings: false }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string; error?: string } | null;
        setServerError(body?.message ?? "An unexpected error occurred");
        return;
      }
      const updated = await response.json() as CompanyResponseDto;
      applyUpdatedCompany(updated);
      validation.dismiss();
      setToastMessage(`De-coupled ${updated.code} from Organization base financial settings`);
      setToastVisible(true);
      router.refresh();
    } finally {
      setChangingStandardSettings(false);
    }
  };

  const handleStatusChange = async (target: "archive" | "restore") => {
    setIsArchiveOpen(false);
    setIsRestoreOpen(false);
    setLifecycleAction(target);
    setServerError("");
    try {
      const operation = target === "archive" ? "deactivate" : "activate";
      const response = await fetch(
        `/api/organization/companies/${encodeURIComponent(currentCompany.code)}/${operation}`,
        { method: "POST" },
      );
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setServerError(body?.message ?? "An unexpected error occurred");
        return;
      }
      const updated = await response.json() as CompanyResponseDto;
      applyUpdatedCompany(updated);
      setToastMessage(target === "archive" ? `Archived ${updated.code}` : `Restored ${updated.code}`);
      setToastVisible(true);
      router.refresh();
    } finally {
      setLifecycleAction(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleteOpen(false);
    setLifecycleAction("delete");
    setServerError("");
    try {
      const response = await fetch(`/api/organization/companies/${encodeURIComponent(currentCompany.code)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setServerError(body?.message ?? "An unexpected error occurred");
        return;
      }
      router.replace(`/organization/companies?toast=${encodeURIComponent(`Deleted ${currentCompany.code}`)}`);
      router.refresh();
    } finally {
      setLifecycleAction(null);
    }
  };

  const handleAccessArchivedCompany = async () => {
    setAccessingArchivedCompany(true);
    setServerError("");
    try {
      const response = await fetch("/api/company-selection/archived", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: currentCompany.id,
        } satisfies CompanySelectionUpdateRequestDto),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { message?: string } | null;
        setServerError(body?.message ?? "Could not access the archived company.");
        return;
      }
      window.location.assign("/finance/journals");
    } finally {
      setAccessingArchivedCompany(false);
    }
  };

  const handleSave = () => {
    setServerError("");
    if (!validation.attempt()) return;
    if (codeBlockers.length) {
      setServerError(codeBlockers.map((blocker) => blocker.message).join("; "));
      return;
    }
    if (code !== currentCompany.code) {
      setIsCodeChangeOpen(true);
      return;
    }
    void executeSave();
  };

  const isArchived = currentCompany.status === "INACTIVE";

  return (
    <div className={`${layoutStyles.detailView} ${layoutStyles.detailViewWithStatusRail}`}>
      <header className={layoutStyles.detailHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layoutStyles.slotTitle}>
          <div className={detailStyles.title}>
            <div className={detailStyles.titleIcon}>
              <span className={`material-symbols-outlined ${detailStyles.titleIconSymbol}`}>domain</span>
            </div>
            <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>{name || currentCompany.name}</h1>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <DetailBackButton fallbackHref={"/organization/companies"} />
          </div>
        </div>
      </header>

      <div className={layoutStyles.slotAlert}>
        <ValidationAlert
          errors={currentErrors}
          visible={validation.showErrors || !!serverError}
          onDismiss={() => {
            validation.dismiss();
            setServerError("");
          }}
        />
      </div>

      <aside className={layoutStyles.statusSection}>
        <div className={detailStyles.card}>
          <div className={detailStyles.fieldGroup}>
            <label className={typography.fieldLabel}>Status</label>
            <Badge variant="soft" size="x-large" color={getStatusSemanticColor(currentCompany.status)}>
              {currentCompany.status === "INACTIVE" ? "ARCHIVED" : currentCompany.status}
            </Badge>
          </div>
          {isArchived ? (
            <div className={detailStyles.fieldGroup}>
              <a
                href="/finance/journals"
                className={typography.link}
                aria-disabled={accessingArchivedCompany}
                onClick={(event) => {
                  event.preventDefault();
                  if (!accessingArchivedCompany) void handleAccessArchivedCompany();
                }}
              >
                {accessingArchivedCompany ? "Accessing archived company..." : "Access archived company"}
              </a>
            </div>
          ) : null}
          {currentCompany.hasPostings ? (
            <div className={detailStyles.fieldGroup}>
              <Badge variant="soft" size="medium" customColors={getHasPostingsColor(currentCompany.hasPostings)}>
                HAS POSTINGS
              </Badge>
            </div>
          ) : null}
        </div>
        <AuditPanel
          id={currentCompany.id}
          creationDate={currentCompany.audit.created.date}
          updatedDate={currentCompany.audit.updated.date}
          creationActorType={currentCompany.audit.created.actorType}
          creationUser={currentCompany.audit.created.user}
          updatedActorType={currentCompany.audit.updated.actorType}
          updatedUser={currentCompany.audit.updated.user}
          auditHref="/settings/audit"
          mutationId={currentCompany.audit.updated.mutationId ?? currentCompany.audit.created.mutationId}
        />
      </aside>

      <main className={`${layoutStyles.mainSection} ${localStyles.mainSection}`}>
        <TabGroup
          defaultKey="details"
          tabs={[
            {
              key: "details",
              label: "Details",
              content: (
                <div className={localStyles.tabContent}>
        <section className={detailStyles.card}>
          <div className={detailStyles.cardHeader}>
            <h2 className={`${typography.sectionHeading} ${detailStyles.cardHeaderTitle}`}>Company Details</h2>
            <div className={detailStyles.cardHeaderActions}>
              <Button variant="secondary" icon="save" disabled={saving || isArchived} onClick={handleSave}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Code</span>
              <Input
                invalid={validation.hasError("code")}
                value={code}
                maxLength={14}
                disabled={isArchived || codeChangeAvailabilityBlockers.length > 0}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
              />
              <span className={typography.fieldHelp}>Capital letters, numbers, dash and underscore only. 14 characters max.</span>
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Name</span>
              <Input
                invalid={validation.hasError("name")}
                value={name}
                maxLength={50}
                disabled={isArchived}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Country</span>
              <SearchableSelect
                value={countryCode}
                onChange={setCountryCode}
                options={activeCountries}
                disabled={isArchived}
                placeholder="Select country"
                searchPlaceholder="Search countries..."
                hasError={validation.hasError("country")}
              />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Base Currency</span>
              <SearchableSelect
                value={currencyCode}
                onChange={setCurrencyCode}
                options={activeCurrencies}
                disabled={isArchived}
                placeholder="Select currency"
                searchPlaceholder="Search currencies..."
                hasError={validation.hasError("currency")}
              />
            </label>
          </div>
        </section>

        <section className={detailStyles.card}>
          <h2 className={typography.sectionHeading}>Tax Filing - Tax on Sales</h2>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Anchor Month</span>
              <SearchableSelect value={taxFilingAnchorMonth} onChange={setTaxFilingAnchorMonth} options={TAX_FILING_MONTH_OPTIONS} searchable={false} codeBadge={false} disabled={isArchived} />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Interval</span>
              <SearchableSelect value={taxFilingIntervalMonths} onChange={setTaxFilingIntervalMonths} options={TAX_FILING_INTERVAL_OPTIONS} searchable={false} codeBadge={false} disabled={isArchived} />
            </label>
          </div>
        </section>

        <section className={detailStyles.card}>
          <h2 className={typography.sectionHeading}>Report Text</h2>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Report Heading Line 1</span>
              <Input maxLength={80} value={reportLine1} disabled={isArchived} onChange={(event) => setReportLine1(event.target.value)} />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Report Heading Line 2</span>
              <Input maxLength={80} value={reportLine2} disabled={isArchived} onChange={(event) => setReportLine2(event.target.value)} />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Report Footer</span>
              <Input maxLength={80} value={reportFooter} disabled={isArchived} onChange={(event) => setReportFooter(event.target.value)} />
            </label>
          </div>
        </section>
                </div>
              ),
            },
            {
              key: "settings",
              label: "Settings",
              content: (
                <div className={localStyles.tabContent}>
                  <section className={`${detailStyles.card} ${localStyles.settingsSection}`}>
                    <h2 className={typography.subsectionHeading}>Organization base financial settings</h2>
                    {currentCompany.useOrganizationStandardSettings ? (
                      <>
                        <p className={localStyles.settingsText}>
                          This company uses Organization base financial settings. This means that any financial settings changes made in the Organization domain, for example changing General Ledger Accounts, will automatically flow through to this company. You can allow the company to use its own financial settings, but be aware that you cannot then switch the company back to using Organization base settings.{" "}
                          {organizationCompaniesHelpUrl ? (
                            <a href={organizationCompaniesHelpUrl} target="_blank" rel="noreferrer">Learn more</a>
                          ) : null}
                        </p>
                        <div className={localStyles.settingsActions}>
                        <Button
                          variant="secondary"
                          disabled={changingStandardSettings || isArchived}
                          onClick={() => setIsStandardSettingsChangeOpen(true)}
                        >
                          De-couple from organization base settings
                        </Button>
                        </div>
                      </>
                    ) : (
                      <p className={localStyles.settingsText}>This company does not use Organization base Financial Settings.</p>
                    )}
                  </section>

                  <section className={`${detailStyles.card} ${localStyles.settingsSection}`}>
                    <h2 className={typography.subsectionHeading}>Archive Company</h2>
                    <p className={localStyles.settingsText}>
                      {isArchived
                        ? "This company has been archived."
                        : "When you archive a company it will become read-only and will not accept any postings. As part of this process, Company Financial settings will be de-coupled from Organization base settings."}
                    </p>
                    <div className={localStyles.settingsActions}>
                      {isArchived ? (
                        <Button
                          variant="secondary"
                          disabled={lifecycleAction !== null}
                          onClick={() => setIsRestoreOpen(true)}
                        >
                          Restore Company
                        </Button>
                      ) : (
                        <Button
                          variant="secondary-destructive"
                          disabled={lifecycleAction !== null}
                          onClick={() => setIsArchiveOpen(true)}
                        >
                          Archive Company
                        </Button>
                      )}
                    </div>
                  </section>

                  <section className={`${detailStyles.card} ${localStyles.settingsSection}`}>
                    <h2 className={typography.subsectionHeading}>Delete Company</h2>
                    <p className={localStyles.settingsText}>
                      When you delete a company it is permanently deleted and the data can never be restored. Ensure you have a full database backup before doing this.
                    </p>
                    <div className={localStyles.settingsActions}>
                      <Button
                        variant="danger"
                        disabled={lifecycleAction !== null}
                        onClick={() => setIsDeleteOpen(true)}
                      >
                        Delete Company
                      </Button>
                    </div>
                  </section>
                </div>
              ),
            },
          ]}
        />
      </main>

      <ConfirmDialog
        isOpen={isCodeChangeOpen}
        title="Change Company Code"
        message="You are about to change the company code. External integrations may need to be updated."
        confirmLabel="Proceed"
        confirmVariant="primary"
        onClose={() => setIsCodeChangeOpen(false)}
        onConfirm={executeSave}
      />
      <ConfirmDialog
        isOpen={isStandardSettingsChangeOpen}
        title="De-couple Company"
        message={(
          <>
            <p>This is a one-way change. The company will receive its own copy of the current Organization financial settings, and future Organization financial settings changes will no longer flow through.</p>
            <p>Inventory items and categories will not be changed.</p>
          </>
        )}
        confirmLabel="De-couple Company"
        confirmVariant="danger"
        onClose={() => setIsStandardSettingsChangeOpen(false)}
        onConfirm={handleConfirmStandardSettingsChange}
      />
      <ConfirmDialog
        isOpen={isArchiveOpen}
        title="Archive Company"
        message={(
          <>
            <p>This company will become read-only and will no longer accept postings.</p>
            <p>Its financial settings will be de-coupled from Organization base settings. Restoring the company later will not re-couple those settings.</p>
          </>
        )}
        confirmLabel="Archive Company"
        confirmVariant="danger"
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={() => { void handleStatusChange("archive"); }}
      />
      <ConfirmDialog
        isOpen={isRestoreOpen}
        title="Restore Company"
        message="This company will become active and accept postings again. It will continue to use its own financial settings."
        confirmLabel="Restore Company"
        confirmVariant="primary"
        onClose={() => setIsRestoreOpen(false)}
        onConfirm={() => { void handleStatusChange("restore"); }}
      />
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete Company"
        icon="warning"
        message={(
          <>
            <p>Are you sure you want to delete {currentCompany.name}?</p>
            <p><strong>This company and all of its financial and inventory records will be permanently deleted.</strong></p>
            <p>Ensure you have a full database backup before proceeding.</p>
          </>
        )}
        confirmLabel="Delete Company"
        confirmVariant="danger"
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => { void handleDelete(); }}
      />
      <Toast isVisible={toastVisible} onClose={() => setToastVisible(false)} message={toastMessage} />
    </div>
  );
}

