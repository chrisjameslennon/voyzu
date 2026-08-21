"use client";

import { OrganizationAuditPanel as AuditPanel } from "@voyzu/organization/common/client";


import { DetailBackButton } from "@voyzu/ui-surface/client";
import { getHasPostingsColor, getStatusSemanticColor } from "@voyzu/organization/common/client";
import type { CountryResponseDto } from "@voyzu/organization/types/modules/countries";
import { Badge, Breadcrumbs, Input } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

interface CountryDetailProps {
  country: CountryResponseDto;
  taxHelpUrl?: string;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatTaxFilingAnchorMonth(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

function formatTaxFilingInterval(months: number): string {
  if (months === 1) return "Monthly";
  if (months === 2) return "Every 2 months";
  if (months === 3) return "Quarterly";
  if (months === 6) return "Half yearly";
  if (months === 12) return "Annually";
  return `Every ${months} months`;
}

function formatRate(rate: number): string {
  const percentage = rate * 100;
  return percentage.toFixed(3).replace(/\.?0+$/, "");
}

export function CountryDetail({ country, taxHelpUrl }: CountryDetailProps) {

  return (
    <div className={`${layoutStyles.detailView} ${layoutStyles.detailViewWithStatusRail}`}>
      <header className={layoutStyles.detailHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>
        <div className={layoutStyles.slotTitle}>
          <div className={detailStyles.title}>
            <div className={detailStyles.titleIcon}>
              <span className={`material-symbols-outlined ${detailStyles.titleIconSymbol}`}>
                globe
              </span>
            </div>
            <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>
              {country.name}
            </h1>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <DetailBackButton fallbackHref={"/organization/countries"} />
          </div>
        </div>
      </header>

      <aside className={layoutStyles.statusSection}>
        <div className={detailStyles.card}>
          <div className={detailStyles.fieldGroup}>
            <label className={typography.fieldLabel}>Status</label>
            <Badge
              variant="soft"
              size="x-large"
              color={getStatusSemanticColor(country.status)}
            >
              {country.status}
            </Badge>
          </div>
          {country.hasPostings ? (
            <div className={detailStyles.fieldGroup}>
              <Badge
                variant="soft"
                size="medium"
                customColors={getHasPostingsColor(country.hasPostings)}
              >
                HAS POSTINGS
              </Badge>
            </div>
          ) : null}
        </div>
        <AuditPanel
          id={country.id}
          creationDate={country.audit.created.date}
          updatedDate={country.audit.updated.date}
          creationActorType={country.audit.created.actorType}
          creationUser={country.audit.created.user}
          updatedActorType={country.audit.updated.actorType}
          updatedUser={country.audit.updated.user}
          auditHref={`/settings/audit?entityType=country&entityCode=${encodeURIComponent(country.code)}`}
          mutationId={country.audit.updated.mutationId ?? country.audit.created.mutationId}
        />
      </aside>

      <main className={layoutStyles.mainSection}>
        <section className={detailStyles.card}>
          <h2 className={typography.sectionHeading}>Country Details</h2>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Code</span>
              <Input value={country.code} disabled />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Name</span>
              <Input value={country.name} disabled />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Currency</span>
              <Input value={`${country.currency.name} (${country.currency.code})`} disabled />
            </label>
            {country.financialPeriodStartMonth && (
              <label className={detailStyles.fieldGroup}>
                <span className={typography.fieldLabel}>Financial Year Start</span>
                <Input value={country.financialPeriodStartMonth} disabled />
              </label>
            )}
          </div>
        </section>

        <section className={detailStyles.card}>
          <h2 className={`${typography.subsectionHeading} ${detailStyles.sectionHeading}`}>
            <span className="material-symbols-outlined">event_repeat</span>
            Tax Filing - Tax on Sales
          </h2>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Anchor Month</span>
              <Input value={formatTaxFilingAnchorMonth(country.taxFilingAnchorMonth)} disabled />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Interval</span>
              <Input value={formatTaxFilingInterval(country.taxFilingIntervalMonths)} disabled />
            </label>
          </div>
        </section>

        <section className={detailStyles.sectionIntro}>
          <h2 className={typography.subsectionHeading}>Tax Settings</h2>
          <p className={typography.headingByline}>
            Country Tax settings are used to calculate tax when financial documents are posted to the system.{" "}
            {taxHelpUrl ? (
              <a href={taxHelpUrl} target="_blank" rel="noreferrer" className={typography.link}>Learn more</a>
            ) : null}
          </p>
        </section>

        {country.taxAuthorities && country.taxAuthorities.length > 0 && (
          <section className={detailStyles.card}>
            <h2 className={`${typography.subsectionHeading} ${detailStyles.sectionHeading}`}>
              <span className="material-symbols-outlined">account_balance</span>
              Tax Authorities
            </h2>
            <div className={detailStyles.tableWrap}>
              <table className={detailStyles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Region</th>
                    <th>Jurisdiction</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {country.taxAuthorities.map((authority) => (
                    <tr key={authority.id}>
                      <td className={detailStyles.strongCell}>{authority.code}</td>
                      <td className={detailStyles.strongCell}>{authority.name}</td>
                      <td>{authority.regionCode ?? "-"}</td>
                      <td>{authority.jurisdictionLevel}</td>
                      <td>{authority.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {country.taxRules && country.taxRules.length > 0 && (
          <section className={detailStyles.card}>
            <h2 className={`${typography.subsectionHeading} ${detailStyles.sectionHeading}`}>
              <span className="material-symbols-outlined">rule</span>
              Tax Rules
            </h2>
            <div className={detailStyles.tableWrap}>
              <table className={detailStyles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Region</th>
                    <th>Name</th>
                    <th>Invoice Label</th>
                    <th>Calculation</th>
                    <th>Lines</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {country.taxRules.map((rule) => (
                    <tr key={rule.id}>
                      <td className={detailStyles.strongCell}>{rule.code}</td>
                      <td>{rule.regionCode ?? "-"}</td>
                      <td>{rule.name}</td>
                      <td>{rule.invoiceLabel}</td>
                      <td>{rule.calculationMethod === "CONFIGURED_COMPONENTS" ? "SEE TAX RULE LINES" : rule.calculationMethod}</td>
                      <td className={detailStyles.numericCell}>{rule.componentCount}</td>
                      <td>{rule.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {country.taxComponents && country.taxComponents.length > 0 && (
          <section className={detailStyles.card}>
            <h2 className={`${typography.subsectionHeading} ${detailStyles.sectionHeading}`}>
              <span className="material-symbols-outlined">receipt_long</span>
              Tax Rule Lines
            </h2>
            <div className={detailStyles.tableWrap}>
              <table className={detailStyles.table}>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Tax Rule</th>
                    <th>Authority</th>
                    <th>Scheme</th>
                    <th>Invoice Label</th>
                    <th className={detailStyles.numericCell}>Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {country.taxComponents.map((component) => (
                    <tr key={component.id}>
                      <td className={detailStyles.strongCell}>{component.code}</td>
                      <td className={detailStyles.strongCell}>{component.taxRuleCode}</td>
                      <td>{component.taxAuthorityCode}</td>
                      <td>{component.schemeCode}</td>
                      <td>{component.invoiceLabel}</td>
                      <td className={detailStyles.numericCell}>{formatRate(component.rate)}%</td>
                      <td>{component.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

    </div>
  );
}

