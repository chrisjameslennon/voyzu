"use client";

import { OrganizationAuditPanel as AuditPanel } from "@voyzu/organization/common/client";


import { DetailBackButton } from "@voyzu/ui-surface/client";
import { getHasPostingsColor, getStatusSemanticColor } from "@voyzu/organization/common/client";
import type { CurrencyResponseDto } from "@voyzu/organization/types/modules/currencies";
import { Badge, Breadcrumbs, Input } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/detail.layout.module.css";
import detailStyles from "@voyzu/ui-style/css-modules/detail.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

interface CurrencyDetailProps {
  currency: CurrencyResponseDto;
}

export function CurrencyDetail({ currency }: CurrencyDetailProps) {

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
              {currency.name}
            </h1>
          </div>
        </div>
        <div className={layoutStyles.slotActions}>
          <div className={detailStyles.headerActions}>
            <DetailBackButton fallbackHref={"/organization/currencies"} />
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
              color={getStatusSemanticColor(currency.status)}
            >
              {currency.status}
            </Badge>
          </div>
          {currency.hasPostings ? (
            <div className={detailStyles.fieldGroup}>
              <Badge
                variant="soft"
                size="medium"
                customColors={getHasPostingsColor(currency.hasPostings)}
              >
                HAS POSTINGS
              </Badge>
            </div>
          ) : null}
        </div>
        <AuditPanel
          id={currency.id}
          creationDate={currency.audit.created.date}
          updatedDate={currency.audit.updated.date}
          creationActorType={currency.audit.created.actorType}
          creationUser={currency.audit.created.user}
          updatedActorType={currency.audit.updated.actorType}
          updatedUser={currency.audit.updated.user}
          auditHref={`/settings/audit?entityType=currency&entityCode=${encodeURIComponent(currency.code)}`}
          mutationId={currency.audit.updated.mutationId ?? currency.audit.created.mutationId}
        />
      </aside>

      <main className={layoutStyles.mainSection}>
        <section className={detailStyles.card}>
          <h2 className={typography.sectionHeading}>Currency Details</h2>
          <div className={detailStyles.formGrid}>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Code</span>
              <Input value={currency.code} disabled />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Name</span>
              <Input value={currency.name} disabled />
            </label>
            <label className={detailStyles.fieldGroup}>
              <span className={typography.fieldLabel}>Symbol</span>
              <Input value={currency.symbol ?? ""} disabled />
            </label>
          </div>
        </section>
      </main>

    </div>
  );
}

