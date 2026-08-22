"use client";

import { LocalizationAuditPanel as AuditPanel } from "@voyzu/localization/common/client";


import { DetailBackButton } from "@voyzu/ui-surface/client";
import { getStatusSemanticColor } from "@voyzu/localization/common/client";
import type { CountryResponseDto } from "@voyzu/localization/types/modules/countries";
import { Badge, Breadcrumbs, Input } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

interface CountryDetailProps {
  country: CountryResponseDto;
}

export function CountryDetail({ country }: CountryDetailProps) {

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
            <DetailBackButton fallbackHref={"/settings/localization/countries"} />
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
          </div>
        </section>
      </main>

    </div>
  );
}

