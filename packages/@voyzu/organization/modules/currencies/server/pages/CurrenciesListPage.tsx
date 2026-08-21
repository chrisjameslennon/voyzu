import "server-only";

import { Breadcrumbs } from "@voyzu/ui-components";
import layoutStyles from "@voyzu/ui-layout/css-modules/list.layout.module.css";
import listStyles from "@voyzu/ui-style/css-modules/list.module.css";
import typography from "@voyzu/ui-style/css-modules/typography.module.css";

import { CurrenciesListContent } from "../../client";
import { listCurrencies } from "../lib/currency.service";

export async function CurrenciesListPage() {
  const currencies = await listCurrencies();

  return (
    <div className={layoutStyles.listView}>
      <header className={layoutStyles.listHeader}>
        <div className={layoutStyles.slotBreadcrumb}>
          <Breadcrumbs />
        </div>

        <div className={layoutStyles.slotTitle}>
          <div className={listStyles.titleIcon}>
            <span className={`material-symbols-outlined ${listStyles.titleIconSymbol}`}>
              globe
            </span>
          </div>
          <h1 className={`${typography.pageTitle} ${layoutStyles.pageTitleResponsive}`}>
            Currencies
          </h1>
          <div className={layoutStyles.slotTitleByline}>
            <p className={typography.headingByline}>
              Currencies define the money units available for companies.
            </p>
          </div>
        </div>
      </header>

      <CurrenciesListContent currencies={currencies} />
    </div>
  );
}
